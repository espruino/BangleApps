const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");
const fakeBLE = require("../helpers/fake_ble");

function tick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function createTimers(options) {
  const reconnectTimers = [];
  const heldTimers = [];
  let held = false;

  options = options || {};
  return {
    hold(value) { held = value; },
    runDelay(ms) {
      const timer = heldTimers.find(item => item.active && item.ms === ms);
      assert.ok(timer, "No pending timer for " + ms);
      timer.active = false;
      timer.fn();
    },
    pendingCount() { return heldTimers.concat(reconnectTimers).filter(item => item.active).length; },
    setTimeout(fn, ms) {
      if (held) {
        const timer = { fn, ms, active: true };
        heldTimers.push(timer);
        return timer;
      }
      if (ms === 2000 || ms === 3000 || ms === 4000) {
        Promise.resolve().then(fn);
        return -1;
      }
      if (options.manualReconnect && (ms === 5000 || ms === 10000 || ms === 20000 || ms === 30000)) {
        const timer = { fn, ms, active: true };
        reconnectTimers.push(timer);
        return timer;
      }
      return setTimeout(fn, ms);
    },
    clearTimeout(id) {
      if (id && id.fn) {
        id.active = false;
        return;
      }
      if (id !== -1) clearTimeout(id);
    },
    runNextReconnect() {
      const timer = reconnectTimers.shift();
      if (timer && timer.active) Promise.resolve().then(timer.fn);
    },
    hasReconnect() {
      return reconnectTimers.some(timer => timer.active);
    }
  };
}

function createLoadedBLE(options) {
  options = options || {};
  const protocol = loader.create().require("coretemp.protocol");
  const env = fakeBLE.create(protocol, options.fakeBLE);
  let cachedAttachFailureMode = options.cachedAttachFailureMode;
  const emitted = [];
  const Bangle = {
    _PWR: {
      CORESensor: ["test"]
    },
    emit(name, data) {
      emitted.push({ name, data });
    }
  };
  const timers = createTimers(options.timers);
  const storage = fakeStorage.create({
    "coretemp.json": Object.assign({
      btid: "core-1", settingsVersion: 2
    }, options.settings || {})
  });
  const loaded = loader.create({
    storage,
    globals: {
      Bangle,
      NRF: env.NRF,
      BluetoothRemoteGATTCharacteristic: function () {
        return {
          on() {},
          readValue() { return Promise.resolve(new DataView(new Uint8Array([90]).buffer)); },
          startNotifications() {
            if (cachedAttachFailureMode === "disconnect_once") {
              cachedAttachFailureMode = undefined;
              env.gatt.connected = false;
              env.device.emitDisconnect("drop during cached attach");
              return Promise.reject(new Error("Disconnected"));
            }
            if (cachedAttachFailureMode === "busy_once") {
              cachedAttachFailureMode = undefined;
              return Promise.reject(new Error("ERR 0x11 (BUSY)"));
            }
            return Promise.resolve();
          },
          writeValue() { return Promise.resolve(); }
        };
      },
      setTimeout: timers.setTimeout,
      clearTimeout: timers.clearTimeout
    }
  });
  return {
    loaded,
    ble: loaded.require("coretemp.ble"),
    protocol,
    env,
    storage,
    Bangle,
    emitted,
    timers
  };
}

async function drain() {
  for (let i = 0; i < 20; i++) await tick();
}

module.exports = [
  {
    name: "fresh discovery resolves CORE directly when unfiltered discovery hides vendor UUIDs",
    async fn() {
      const { ble, protocol, env, emitted } = createLoadedBLE();
      let unfilteredCalls = 0;
      env.gatt.getPrimaryServices = () => {
        unfilteredCalls++;
        return Promise.resolve([{ uuid: "0x0000[vendor]" }]);
      };
      ble.init();
      await ble.connect();

      assert.strictEqual(unfilteredCalls, 0);
      assert.deepStrictEqual(env.getPrimaryServiceCalls, [protocol.CORE_SERVICE_UUID, protocol.BATTERY_SERVICE_UUID]);
      assert.strictEqual(env.tempChar.notificationsStarted, true);
      assert.strictEqual(env.controlPointChar.notificationsStarted, true);
      env.tempChar.emitValue([0, 0x74, 0x0e]);
      const measurement = emitted.find(e => e.name === "CORESensor").data;
      assert.strictEqual(measurement.core, 37);
      assert.strictEqual(measurement.battery, 90);
      assert.strictEqual(ble.getStatus().hasCache, true);
    }
  },
  {
    name: "missing battery service does not prevent temperature attachment",
    async fn() {
      const { ble, protocol, env } = createLoadedBLE();
      const discover = env.gatt.getPrimaryService.bind(env.gatt);
      env.gatt.getPrimaryService = uuid => uuid === protocol.BATTERY_SERVICE_UUID ?
        Promise.reject("No Services found") : discover(uuid);
      ble.init();
      await ble.connect();
      assert.strictEqual(ble.getStatus().profile, "custom_core");
      assert.strictEqual(env.tempChar.notificationsStarted, true);
    }
  },
  {
    name: "service discovery transport errors propagate without trying other services",
    async fn() {
      for (const failedService of ["CORE_SERVICE_UUID", "BATTERY_SERVICE_UUID"]) {
        const { ble, protocol, env, timers } = createLoadedBLE({
            timers: { manualReconnect: true }
        });
        const discover = env.gatt.getPrimaryService.bind(env.gatt);
        const calls = [];
        const failure = new Error("Disconnected during service discovery");
        env.gatt.getPrimaryService = uuid => {
          calls.push(uuid);
          return uuid === protocol[failedService] ? Promise.reject(failure) : discover(uuid);
        };
        ble.init();
        await assert.rejects(ble.connect(), err => err === failure);
        assert.deepStrictEqual(calls, failedService === "CORE_SERVICE_UUID" ?
          [protocol.CORE_SERVICE_UUID] : [protocol.CORE_SERVICE_UUID, protocol.BATTERY_SERVICE_UUID]);
        assert.strictEqual(ble.getStatus().hasCache, false);
        assert.strictEqual(timers.hasReconnect(), true);
      }
    }
  },
  {
    name: "rapid release and reacquire honors the latest power demand",
    async fn() {
      const { ble, Bangle } = createLoadedBLE();
      ble.init();
      await ble.connect();
      ble.setPower(0, "test");
      ble.setPower(1, "recorder");
      await drain();
      assert.strictEqual(ble.isConnected(), true);
      assert.deepStrictEqual(Array.from(Bangle._PWR.CORESensor), ["recorder"]);
      ble.setPower(0, "recorder");
      await drain();
      assert.strictEqual(ble.isConnected(), false);
    }
  },
  {
    name: "on-demand startup stays idle and multiple owners share one connection",
    async fn() {
      const { ble, Bangle, env } = createLoadedBLE();
      Bangle._PWR.CORESensor = [];
      ble.init();
      ble.applySettings();
      await drain();
      assert.strictEqual(env.NRF.requests.length, 0);
      assert.strictEqual(ble.isOn(), false);
      ble.setPower(1, "app");
      ble.setPower(1, "recorder");
      await drain();
      assert.strictEqual(env.NRF.requests.length, 1);
      assert.strictEqual(ble.isConnected(), true);
      ble.setPower(0, "app");
      await drain();
      assert.strictEqual(ble.isConnected(), true);
      ble.setPower(0, "recorder");
      await drain();
      assert.strictEqual(ble.isConnected(), false);
      assert.strictEqual(ble.getStatus().reconnectScheduled, false);
    }
  },
  {
    name: "Always On releases only its owner and Enable off releases all ordinary owners",
    async fn() {
      const { ble, Bangle, storage } = createLoadedBLE({ settings: { enabled: true, alwaysOn: true } });
      ble.init();
      ble.applySettings();
      await drain();
      assert.ok(Bangle._PWR.CORESensor.includes("coretemp.enabled"));
      assert.strictEqual(ble.getStatus().alwaysOn, true);
      const settings = storage.readJSON("coretemp.json");
      settings.alwaysOn = false;
      storage.writeJSON("coretemp.json", settings);
      ble.applySettings();
      await drain();
      assert.strictEqual(ble.isConnected(), true);
      assert.deepStrictEqual(Array.from(Bangle._PWR.CORESensor), ["test"]);
      settings.enabled = false;
      settings.alwaysOn = true;
      storage.writeJSON("coretemp.json", settings);
      ble.applySettings();
      await drain();
      assert.strictEqual(ble.isConnected(), false);
      assert.strictEqual(ble.getStatus().alwaysOn, false);
      assert.strictEqual(storage.readJSON("coretemp.json").alwaysOn, false);
      assert.strictEqual(Bangle._PWR.CORESensor.length, 0);
    }
  },
  {
    name: "disabled normal requests are blocked but temporary settings operations work",
    async fn() {
      const { ble, Bangle, env } = createLoadedBLE({ settings: { enabled: false } });
      Bangle._PWR.CORESensor = [];
      ble.init();
      ble.setPower(1, "app");
      await assert.rejects(ble.connect(), /no power owner/);
      assert.strictEqual(env.NRF.requests.length, 0);
      ble.setPower(1, "coretemp.settings");
      await ble.connect();
      assert.strictEqual(ble.isConnected(), true);
      ble.setPower(0, "coretemp.settings");
      await drain();
      assert.strictEqual(ble.isConnected(), false);
      await ble.rebuildCache();
      await drain();
      assert.strictEqual(ble.isConnected(), false);
      await ble.pairDevice(env.device);
      await drain();
      assert.strictEqual(ble.isConnected(), false);
    }
  },
  {
    name: "disabling Enable during discovery prevents a late connection or retry",
    async fn() {
      const { ble, storage, env, timers } = createLoadedBLE({ timers: { manualReconnect: true } });
      const discover = env.gatt.getPrimaryService.bind(env.gatt);
      let finish;
      env.gatt.getPrimaryService = uuid => {
        env.gatt.getPrimaryService = discover;
        return new Promise(resolve => { finish = () => discover(uuid).then(resolve); });
      };
      ble.init();
      const connecting = ble.connect();
      const rejected = assert.rejects(connecting, /power off/);
      await drain();
      storage.writeJSON("coretemp.json", Object.assign(storage.readJSON("coretemp.json"), { enabled: false }));
      ble.applySettings();
      finish();
      await rejected;
      await drain();
      assert.strictEqual(ble.isConnected(), false);
      assert.strictEqual(timers.hasReconnect(), false);
    }
  },
  {
    name: "name-only pairing resolves an ID after success and subsequently prefers it",
    async fn() {
      const { ble, storage, env } = createLoadedBLE({ settings: { btid: undefined, btname: "CORE" } });
      ble.init();
      assert.strictEqual(ble.getStatus().paired, true);
      await ble.connect();
      assert.deepStrictEqual(JSON.parse(JSON.stringify(env.NRF.requests[0].filters)), [{ name: "CORE" }]);
      assert.strictEqual(storage.readJSON("coretemp.json").btid, "core-1");
      await ble.rebuildCache();
      assert.deepStrictEqual(JSON.parse(JSON.stringify(env.NRF.requests[1].filters)), [{ id: "core-1" }]);
    }
  },
  {
    name: "failed name-only connections keep the saved name and remain retryable",
    async fn() {
      const { ble, storage, env, timers } = createLoadedBLE({
        settings: { btid: undefined, btname: "CORE" }, timers: { manualReconnect: true }
      });
      env.NRF.requestDevice = () => Promise.reject(new Error("not found"));
      ble.init();
      await assert.rejects(ble.connect(), /not found/);
      assert.strictEqual(storage.readJSON("coretemp.json").btname, "CORE");
      assert.strictEqual(storage.readJSON("coretemp.json").btid, undefined);
      assert.strictEqual(timers.hasReconnect(), true);
    }
  },
  {
    name: "unpair clears paired CORE state without erasing global BLE bonds",
    async fn() {
      const { ble, storage, Bangle } = createLoadedBLE({
        settings: {
          enabled: true,
          btname: "CORE",
          cache: {
            characteristics: {
              "00002101-5b1e-4347-b07c-97b514dae121": {
                handle: 1,
                uuid: "00002101-5b1e-4347-b07c-97b514dae121",
                notify: true,
                indicate: false,
                read: false,
                write: false
              }
            }
          }
        }
      });
      ble.init();

      await ble.unpairDevice();

      const settings = storage.readJSON("coretemp.json", 1);
      assert.strictEqual(settings.btid, undefined);
      assert.strictEqual(settings.btname, undefined);
      assert.strictEqual(settings.cache, undefined);
      assert.strictEqual(settings.enabled, true);
      assert.strictEqual(settings.alwaysOn, false);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(Bangle._PWR.CORESensor)), []);
      assert.strictEqual(ble.getStatus().paired, false);
      assert.strictEqual(ble.getStatus().desiredConnected, false);
      assert.strictEqual(ble.getStatus().reconnectScheduled, false);
      assert.strictEqual(ble.getStatus().lastError, undefined);
    }
  },
  {
    name: "connect discovers control point and write wrapper resolves indication",
    async fn() {
      const { ble, protocol, env } = createLoadedBLE();
      ble.init();
      await ble.connect();
      assert.strictEqual(env.controlPointChar.notificationsStarted, true);

      const response = ble.writeControlPoint(protocol.OPCODES.HRM_SCAN_ANT_COUNT, [], {
        timeoutMs: 200
      });
      await tick();
      assert.deepStrictEqual(env.controlPointChar.writes, [[protocol.OPCODES.HRM_SCAN_ANT_COUNT]]);
      env.controlPointChar.emitValue([0x80, protocol.OPCODES.HRM_SCAN_ANT_COUNT, 0x01, 3]);
      const result = await response;
      assert.strictEqual(result.requestOpCode, protocol.OPCODES.HRM_SCAN_ANT_COUNT);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(result.payload)), [3]);
    }
  },
  {
    name: "connect accepts normalized uppercase CORE UUIDs",
    async fn() {
      const { ble, protocol, env } = createLoadedBLE({
        fakeBLE: { uppercaseUuids: true }
      });
      ble.init();
      await ble.connect();
      assert.strictEqual(env.controlPointChar.notificationsStarted, true);

      const response = ble.writeControlPoint(protocol.OPCODES.HRM_PAIRED_COUNT, [], {
        timeoutMs: 200
      });
      await tick();
      env.controlPointChar.emitValue([0x80, protocol.OPCODES.HRM_PAIRED_COUNT, 0x01, 0]);
      assert.strictEqual((await response).requestOpCode, protocol.OPCODES.HRM_PAIRED_COUNT);
    }
  },
  {
    name: "connect does not attempt implicit BLE bonding",
    async fn() {
      const { ble, env } = createLoadedBLE({
        fakeBLE: {
          bonded: false,
          bondReject: new Error("Bonding failed")
        }
      });
      ble.init();

      await ble.connect();

      assert.strictEqual(env.gatt.bondCalls, 0);
      assert.strictEqual(ble.getStatus().connected, true);
    }
  },
  {
    name: "pair stores unbonded CORE without BLE bonding",
    async fn() {
      const { ble, env, storage } = createLoadedBLE({
        fakeBLE: {
          bonded: false,
          bondReject: new Error("Bonding failed")
        }
      });
      ble.init();

      await ble.pairDevice(env.device);

      const settings = storage.readJSON("coretemp.json", 1);
      assert.strictEqual(env.gatt.bondCalls, 0);
      assert.strictEqual(settings.btid, "core-1");
      assert.strictEqual(settings.btname, "CORE");
      assert.strictEqual(ble.getStatus().reconnectScheduled, false);
    }
  },
  {
    name: "failed pair flow does not leave background reconnect scheduled",
    async fn() {
      const { ble, env, timers } = createLoadedBLE({
        fakeBLE: { includeCoreCharacteristics: false },
        timers: { manualReconnect: true }
      });
      ble.init();

      await assert.rejects(
        ble.pairDevice(env.device),
        /Runtime discovery missing required CORE characteristics/
      );

      assert.strictEqual(ble.getStatus().reconnectScheduled, false);
      assert.strictEqual(ble.getStatus().desiredConnected, false);
      assert.strictEqual(timers.hasReconnect(), false);
    }
  },
  {
    name: "owner pause disconnects transport and resume reconnects when power remains",
    async fn() {
      const { ble, env, timers } = createLoadedBLE({
        timers: { manualReconnect: true }
      });
      ble.init();
      await ble.connect();
      assert.strictEqual(env.gatt.connected, true);

      await ble.pause("heatsuite.task");

      assert.strictEqual(ble.isPaused(), true);
      assert.strictEqual(env.gatt.connected, false);
      assert.strictEqual(ble.getStatus().connected, false);
      assert.strictEqual(ble.getStatus().desiredConnected, true);
      assert.strictEqual(timers.hasReconnect(), false);

      await ble.resume("heatsuite.task");

      assert.strictEqual(ble.isPaused(), false);
      assert.strictEqual(env.gatt.connected, true);
      assert.strictEqual(ble.getStatus().connected, true);
    }
  },
  {
    name: "disconnect during cached attach aborts discovery fallback and reconnects cleanly",
    async fn() {
      const { ble, env, timers } = createLoadedBLE({
        cachedAttachFailureMode: "disconnect_once",
        timers: { manualReconnect: true },
        settings: {
          cache: {
            characteristics: {
              "00002101-5b1e-4347-b07c-97b514dae121": {
                handle: 1,
                uuid: "00002101-5b1e-4347-b07c-97b514dae121",
                notify: true,
                indicate: false,
                read: false,
                write: false
              }
            }
          }
        }
      });
      ble.init();

      await assert.rejects(ble.connect(), /Disconnected/);
      assert.strictEqual(env.getPrimaryServiceCalls.length, 0);
      assert.strictEqual(ble.getStatus().reconnectScheduled, true);
      assert.match(ble.getStatus().lastError, /Disconnected/);

      timers.runNextReconnect();
      await drain();

      assert.strictEqual(ble.getStatus().connected, true);
      assert.strictEqual(ble.getStatus().state, "connected");
      assert.strictEqual(env.getPrimaryServiceCalls.length, 0);
    }
  },
  {
    name: "cached BUSY attach retries without discarding handles",
    async fn() {
      const { ble, env } = createLoadedBLE({
        cachedAttachFailureMode: "busy_once",
        settings: {
          cache: {
            characteristics: {
              "00002101-5b1e-4347-b07c-97b514dae121": {
                handle: 1,
                uuid: "00002101-5b1e-4347-b07c-97b514dae121",
                notify: true,
                indicate: false,
                read: false,
                write: false
              }
            }
          }
        }
      });
      ble.init();

      await ble.connect();

      assert.deepStrictEqual(env.getPrimaryServiceCalls, []);
      assert.strictEqual(ble.getStatus().connected, true);
      assert.strictEqual(ble.getStatus().hasCache, true);
    }
  },
  {
    name: "power on while paused does not auto-connect until final pause owner resumes",
    async fn() {
      const { ble, env } = createLoadedBLE();
      ble.init();

      await ble.pause("task-a");
      await ble.pause("task-b");
      ble.setPower(1, "background");
      await drain();

      assert.strictEqual(env.gatt.connected, false);
      assert.strictEqual(ble.getStatus().paused, true);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(ble.getStatus().pauseOwners)), ["task-a", "task-b"]);

      await ble.resume("task-a");
      await drain();
      assert.strictEqual(env.gatt.connected, false);
      assert.strictEqual(ble.isPaused(), true);

      await ble.resume("task-b");

      assert.strictEqual(ble.isPaused(), false);
      assert.strictEqual(env.gatt.connected, true);
    }
  },
  {
    name: "state changes emit CORE status events",
    async fn() {
      const { ble, emitted } = createLoadedBLE({
        settings: { enabled: true }
      });
      ble.init();
      await ble.connect();

      const statusEvents = emitted.filter(e => e.name === "CORESensorStatus");
      const connectedStatus = statusEvents.find(e => e.data && e.data.state === "connected");
      assert(connectedStatus);
      assert.strictEqual(connectedStatus.data.connected, true);
      assert.strictEqual(connectedStatus.data.enabled, true);
      assert.strictEqual(typeof connectedStatus.data.paused, "boolean");
    }
  },
  {
    name: "custom CORE profile does not schedule profile upgrade discovery",
    async fn() {
      const { ble } = createLoadedBLE();
      ble.init();
      await ble.connect();

      assert.strictEqual(ble.getStatus().profile, "custom_core");
      assert.strictEqual(ble.getStatus().profileUpgradeScheduled, false);
      assert.strictEqual(ble.getStatus().customProfileOnly, true);
    }
  },
  {
    name: "custom-only runtime rejects standard health thermometer fallback",
    async fn() {
      const { ble, timers, env, protocol } = createLoadedBLE({
        fakeBLE: { healthThermometerOnly: true },
        timers: { manualReconnect: true }
      });
      ble.init();
      await assert.rejects(
        ble.connect(),
        /Runtime discovery missing required CORE characteristics: missing 00002101-5b1e-4347-b07c-97b514dae121/
      );
      assert.deepStrictEqual(env.getPrimaryServiceCalls, [protocol.CORE_SERVICE_UUID]);
      assert.strictEqual(ble.getStatus().reconnectScheduled, true);

      timers.runNextReconnect();
      await drain();
      assert.strictEqual(ble.getStatus().state, "reconnect_wait");
    }
  },
  {
    name: "custom-only runtime ignores cached standard temperature fallback",
    async fn() {
      const { ble } = createLoadedBLE({
        fakeBLE: { healthThermometerOnly: true },
        timers: { manualReconnect: true },
        settings: {
          cache: {
            characteristics: {
              "0x2a1c": {
                handle: 1,
                uuid: "0x2a1c",
                notify: true,
                indicate: true,
                read: true,
                write: false
              }
            }
          }
        }
      });
      ble.init();
      await assert.rejects(
        ble.connect(),
        /Runtime discovery missing required CORE characteristics: missing 00002101-5b1e-4347-b07c-97b514dae121/
      );
      assert.strictEqual(ble.getStatus().profile, undefined);
    }
  },
  {
    name: "connect prefers custom CORE temperature when both profiles are present",
    async fn() {
      const { ble, env, protocol } = createLoadedBLE({
        fakeBLE: { includeHealthThermometer: true }
      });
      ble.init();
      await ble.connect();

      assert.strictEqual(env.tempChar.notificationsStarted, true);
      assert.strictEqual(env.healthThermometerChar.notificationsStarted, undefined);
      assert.deepStrictEqual(env.getPrimaryServiceCalls, [protocol.CORE_SERVICE_UUID, protocol.BATTERY_SERVICE_UUID]);
    }
  },
  {
    name: "discovery mismatch keeps background reconnect scheduled",
    async fn() {
      const { ble, timers } = createLoadedBLE({
        fakeBLE: { includeCoreCharacteristics: false },
        timers: { manualReconnect: true }
      });
      ble.init();
      await assert.rejects(
        ble.connect(),
        /Runtime discovery missing required CORE characteristics: missing/
      );
      assert.strictEqual(ble.getStatus().reconnectScheduled, true);

      timers.runNextReconnect();
      await drain();

      const status = ble.getStatus();
      assert.strictEqual(status.reconnectScheduled, true);
      assert.strictEqual(status.desiredConnected, true);
      assert.strictEqual(status.state, "reconnect_wait");
    }
  },
  {
    name: "mismatched indication is discarded until matching opcode arrives",
    async fn() {
      const { ble, protocol, env } = createLoadedBLE();
      ble.init();
      await ble.connect();
      const response = ble.writeControlPoint(protocol.OPCODES.HRM_PAIRED_COUNT, [], {
        timeoutMs: 200
      });
      await tick();
      env.controlPointChar.emitValue([0x80, protocol.OPCODES.HRM_SCAN_ANT_COUNT, 0x01, 7]);
      await tick();
      env.controlPointChar.emitValue([0x80, protocol.OPCODES.HRM_PAIRED_COUNT, 0x01, 1]);
      assert.strictEqual((await response).payload[0], 1);
    }
  },
  {
    name: "disconnect cancels active control point request",
    async fn() {
      const { ble, protocol, env, Bangle } = createLoadedBLE();
      ble.init();
      await ble.connect();
      const response = ble.writeControlPoint(protocol.OPCODES.HRM_PAIRED_COUNT, [], {
        timeoutMs: 500
      });
      await tick();
      Bangle._PWR.CORESensor = [];
      env.device.emitDisconnect("drop");
      await assert.rejects(response, /CORE transport closed: disconnect/);
    }
  },
  {
    name: "write wrapper rejects when control point is not connected",
    async fn() {
      const { ble, protocol } = createLoadedBLE();
      ble.init();
      await assert.rejects(
        ble.writeControlPoint(protocol.OPCODES.HRM_PAIRED_COUNT, [], { timeoutMs: 20 }),
        /not connected/
      );
    }
  }
];

module.exports.push(
  {
    name: "temperature-only custom CORE connects without battery or Control Point",
    async fn() {
      const { ble, env, emitted } = createLoadedBLE({ fakeBLE: { includeControlPoint: false, includeBattery: false } });
      await ble.connect();
      assert.strictEqual(ble.getStatus().profile, "custom_core_temperature");
      env.tempChar.emitValue([0, 0x74, 0x0e]);
      assert.strictEqual(emitted.filter(item => item.name === "CORESensor")[0].data.core, 37);
      await assert.rejects(ble.writeControlPoint(4), /not connected/);
      await ble.disconnect();
    }
  },
  {
    name: "ordinary teardown finishes native discovery before targeted disconnect",
    async fn() {
      const { ble, env, storage, timers } = createLoadedBLE({ timers: { manualReconnect: true } });
      const events = [];
      let finish;
      env.gatt.getPrimaryService = () => new Promise(resolve => { finish = resolve; });
      env.gatt.disconnect = () => { events.push("disconnect"); env.gatt.connected = false; };
      env.NRF.disconnect = () => { throw new Error("global disconnect must not be used"); };
      const connecting = assert.rejects(ble.connect(), /power off/);
      await drain();
      const disconnecting = ble.disconnect();
      ble.setPower(1, "another-owner");
      await drain();
      assert.deepStrictEqual(events, []);
      events.push("discovery finished");
      finish(undefined);
      await connecting;
      await disconnecting;
      await drain();
      assert.deepStrictEqual(events, ["discovery finished", "disconnect"]);
      assert.strictEqual(env.NRF.requests.length, 1);
      assert.strictEqual(storage.readJSON("coretemp.json").cache, undefined);
      assert.strictEqual(timers.hasReconnect(), false);
    }
  },
  {
    name: "shutdown cancels settle timers and rejects late native connect without recovery",
    async fn() {
      for (const duringConnect of [false, true]) {
        const { ble, env, timers, storage } = createLoadedBLE({ timers: { manualReconnect: true } });
        let finish;
        if (duringConnect) env.gatt.connect = () => new Promise(resolve => {
          finish = () => { env.gatt.connected = true; resolve(); };
        });
        else timers.hold(true);
        const connecting = assert.rejects(ble.connect(), /stopped/);
        await drain();
        ble.shutdown();
        if (finish) finish();
        await connecting;
        await drain();
        assert.strictEqual(env.gatt.connected, false);
        assert.strictEqual(timers.pendingCount(), 0);
        assert.strictEqual(storage.readJSON("coretemp.json").cache, undefined);
        assert.strictEqual(ble.getStatus().reconnectScheduled, false);
      }
    }
  },
  {
    name: "pair supersession rejects the old caller and only saves the new device and cache",
    async fn() {
      const { ble, env, storage, protocol } = createLoadedBLE();
      const other = fakeBLE.create(protocol);
      other.device.id = "core-2";
      let finish;
      const discover = env.gatt.getPrimaryService.bind(env.gatt);
      env.gatt.getPrimaryService = uuid => new Promise(resolve => { finish = () => discover(uuid).then(resolve); });
      const first = assert.rejects(ble.pairDevice(env.device), /superseded/);
      await drain();
      const second = ble.pairDevice(other.device);
      await drain();
      assert.strictEqual(storage.readJSON("coretemp.json").cache, undefined);
      finish();
      await first;
      await second;
      await drain();
      assert.strictEqual(storage.readJSON("coretemp.json").btid, "core-2");
      assert.ok(storage.readJSON("coretemp.json").cache);
      assert.strictEqual(env.gatt.connected, false);
      assert.strictEqual(other.gatt.connected, true);
      await ble.disconnect();
    }
  },
  {
    name: "pending unpair survives power updates and a previously scheduled retry",
    async fn() {
      const { ble, env, timers, storage } = createLoadedBLE({ timers: { manualReconnect: true } });
      env.NRF.requestDevice = () => Promise.reject(new Error("out of range"));
      await assert.rejects(ble.connect(), /out of range/);
      const unpair = ble.unpairDevice();
      ble.setPower(1, "new-owner");
      timers.runNextReconnect();
      await unpair;
      await drain();
      assert.strictEqual(storage.readJSON("coretemp.json").btid, undefined);
      assert.strictEqual(ble.getStatus().reconnectScheduled, false);
      assert.strictEqual(ble.isOn(), false);
    }
  },
  {
    name: "obsolete notifications and disconnect callbacks cannot affect a rebuilt transport",
    async fn() {
      const { ble, env, emitted } = createLoadedBLE();
      await ble.connect();
      const oldTemperature = env.tempChar.handlers.characteristicvaluechanged[0];
      const oldControlPoint = env.controlPointChar.handlers.characteristicvaluechanged[0];
      const oldDisconnect = env.disconnectHandlers[0];
      await ble.rebuildCache();
      await ble.rebuildCache();
      assert.strictEqual(env.tempChar.handlers.characteristicvaluechanged.length, 1);
      assert.strictEqual(env.disconnectHandlers.length, 1);
      const readings = emitted.filter(item => item.name === "CORESensor").length;
      oldTemperature({ target: { value: new DataView(new Uint8Array([0, 0x74, 0x0e]).buffer) } });
      oldDisconnect("late");
      let resolved = false;
      const request = ble.writeControlPoint(4).then(result => { resolved = true; return result; });
      await tick();
      oldControlPoint({ target: { value: new DataView(new Uint8Array([0x80, 4, 1, 9]).buffer) } });
      await tick();
      assert.strictEqual(resolved, false);
      assert.strictEqual(emitted.filter(item => item.name === "CORESensor").length, readings);
      assert.strictEqual(ble.getStatus().state, "connected");
      env.controlPointChar.emitValue([0x80, 4, 1, 0]);
      assert.strictEqual((await request).payload[0], 0);
      env.tempChar.emitValue([0, 0x74, 0x0e]);
      assert.strictEqual(emitted.filter(item => item.name === "CORESensor").length, readings + 1);
      await ble.disconnect();
    }
  },
  {
    name: "disconnect during successful discovery completion backs off normally",
    async fn() {
      const { ble, env, timers } = createLoadedBLE({ timers: { manualReconnect: true } });
      env.gatt.getPrimaryService = () => {
        env.device.emitDisconnect("out of range");
        return Promise.resolve(undefined);
      };
      await assert.rejects(ble.connect(), /Disconnected/);
      await drain();
      assert.strictEqual(timers.hasReconnect(), true);
      assert.strictEqual(ble.getStatus().state, "reconnect_wait");
      ble.shutdown();
    }
  },
  {
    name: "BUSY spellings use bounded retries and generic power updates respect backoff",
    async fn() {
      for (const message of ["Operation in progress", "ERR 0x11 (BUSY)"]) {
        const { ble, env, timers } = createLoadedBLE({ timers: { manualReconnect: true } });
        let attempts = 0;
        env.gatt.connect = () => { attempts++; return Promise.reject(new Error(message)); };
        await assert.rejects(ble.connect(), new RegExp(message.replace(/[()]/g, "\\$&")));
        assert.strictEqual(attempts, 3);
        ble.setPower(1, "another-owner");
        await drain();
        assert.strictEqual(attempts, 3);
        timers.runNextReconnect();
        await drain();
        assert.strictEqual(attempts, 6);
        ble.shutdown();
      }
    }
  },
  {
    name: "overlapping Settings sessions retain power until their last operation finishes",
    async fn() {
      const { ble, Bangle } = createLoadedBLE();
      await ble.connect();
      let finishFirst, finishSecond;
      const first = ble.runWithConnectedSession("coretemp.settings", () => new Promise(resolve => { finishFirst = resolve; }));
      const second = ble.runWithConnectedSession("coretemp.settings", () => new Promise(resolve => { finishSecond = resolve; }));
      await drain();
      ble.setPower(0, "test");
      finishFirst();
      await first;
      assert.deepStrictEqual(Array.from(Bangle._PWR.CORESensor), ["coretemp.settings"]);
      assert.strictEqual(ble.isConnected(), true);
      finishSecond();
      await second;
      await drain();
      assert.strictEqual(ble.isConnected(), false);
      assert.strictEqual(ble.isOn(), false);
    }
  }
);

async function startHRM() {
  const h = createLoadedBLE({ timers: { manualReconnect: true } });
  const saved = { selected: { antId: 48065, txType: 12 }, recent: [{ antId: 48065, txType: 12 }] };
  h.storage.writeJSON("coretemp.hrm.json", saved);
  await h.ble.connect();
  h.hrm = h.loaded.require("coretemp.hrm");
  h.hrm.init();
  h.saved = saved;
  h.timers.hold(true);
  h.respond = async (opcode, payload) => {
    await tick();
    assert.strictEqual(h.env.controlPointChar.writes.slice(-1)[0][0], opcode);
    h.env.controlPointChar.emitValue([0x80, opcode, 1].concat(payload || []));
    await tick();
  };
  h.reconnect = async () => {
    h.timers.hold(false);
    h.env.device.emitDisconnect("HRM test drop");
    await drain();
    await h.ble.rebuildCache();
  };
  return h;
}

module.exports.push(
  {
    name: "HRM scan interrupted during its window cannot query a new transport",
    async fn() {
      const h = await startHRM();
      const scan = assert.rejects(h.hrm.scanANT(), /superseded/);
      await h.respond(0x0a);
      await assert.rejects(h.hrm.getStatus(), /already in progress/);
      await h.reconnect();
      await scan;
      assert.deepStrictEqual(h.env.controlPointChar.writes, [[0x0a, 255]]);
      assert.deepStrictEqual(h.storage.readJSON("coretemp.hrm.json"), h.saved);
      assert.strictEqual(h.hrm.getState().busy, false);
      await h.ble.disconnect();
    }
  },
  {
    name: "HRM replacement interrupted during settle cannot pair on a new transport",
    async fn() {
      const h = await startHRM();
      const pairing = assert.rejects(h.hrm.pairANT(1234, true), /superseded/);
      await h.respond(4, [1]);
      await h.respond(5, [0xc1, 0xbb, 12]);
      await h.respond(1);
      await h.reconnect();
      await pairing;
      assert.deepStrictEqual(h.env.controlPointChar.writes.map(bytes => bytes[0]), [4, 5, 1]);
      assert.deepStrictEqual(h.storage.readJSON("coretemp.hrm.json"), h.saved);
      await h.ble.disconnect();
    }
  },
  {
    name: "disconnect during pair and clear verification preserves stored selections",
    async fn() {
      for (const clear of [false, true]) {
        const h = await startHRM();
        const rejected = assert.rejects(clear ? h.hrm.clearANT() : h.hrm.pairANT(1234), /closed|Disconnected/);
        if (!clear) await h.respond(4, [0]);
        await h.respond(clear ? 1 : 2);
        assert.strictEqual(h.env.controlPointChar.writes.slice(-1)[0][0], 4);
        h.env.device.emitDisconnect("verification drop");
        await rejected;
        h.timers.hold(false);
        await drain();
        assert.deepStrictEqual(h.storage.readJSON("coretemp.hrm.json"), h.saved);
        h.ble.shutdown();
      }
    }
  },
  {
    name: "HRM and public Control Point failures share one recovery and cancel queued commands",
    async fn() {
      for (const failure of ["sync", "async", "timeout"]) {
        const h = await startHRM();
        let writes = 0;
        h.env.controlPointChar.writeValue = () => {
          writes++;
          if (failure === "sync") throw new Error("write failed");
          if (failure === "async") return Promise.reject(new Error("write failed"));
          return Promise.resolve();
        };
        const results = Promise.allSettled([h.hrm.getStatus(), Promise.resolve().then(() => h.ble.writeControlPoint(0x0b))]);
        await tick();
        if (failure === "timeout") h.timers.runDelay(5000);
        h.timers.hold(false);
        await results.then(items => {
          assert.ok(items.every(item => item.status === "rejected" && item.reason.coreTransportFailure));
        });
        // Cleanup may already be waiting on its settle timer.
        if (h.timers.pendingCount() && !h.timers.hasReconnect()) h.timers.runDelay(2000);
        await drain();
        assert.strictEqual(writes, 1);
        assert.strictEqual(h.timers.pendingCount(), 1);
        assert.strictEqual(h.ble.getStatus().state, "reconnect_wait");
        assert.deepStrictEqual(h.storage.readJSON("coretemp.hrm.json"), h.saved);
        h.ble.shutdown();
      }
    }
  }
);

module.exports.push(
  {
    name: "ordinary Control Point teardown waits for the native write and cancels the queue without writes",
    async fn() {
      const { ble, env } = createLoadedBLE();
      await ble.connect();
      let finish;
      let writes = 0;
      env.controlPointChar.writeValue = () => {
        writes++;
        return new Promise(resolve => { finish = resolve; });
      };
      const requests = Promise.allSettled([ble.writeControlPoint(4), ble.writeControlPoint(5)]);
      await tick();
      const disconnecting = ble.disconnect();
      const results = await requests;
      assert.ok(results.every(item => item.status === "rejected" && /closed/.test(item.reason)));
      await drain();
      assert.strictEqual(env.gatt.connected, true);
      assert.strictEqual(writes, 1);
      finish();
      await disconnecting;
      assert.strictEqual(env.gatt.connected, false);
      assert.strictEqual(writes, 1);
    }
  },
  {
    name: "shutdown during discovery ignores its late result and creates no cache or retry",
    async fn() {
      const { ble, env, storage, timers } = createLoadedBLE({ timers: { manualReconnect: true } });
      const discover = env.gatt.getPrimaryService.bind(env.gatt);
      let finish;
      env.gatt.getPrimaryService = uuid => new Promise(resolve => { finish = () => discover(uuid).then(resolve); });
      const connecting = assert.rejects(ble.connect(), /stopped/);
      await drain();
      ble.shutdown();
      finish();
      await connecting;
      await drain();
      assert.strictEqual(env.gatt.connected, false);
      assert.strictEqual(env.tempChar.notificationsStarted, undefined);
      assert.strictEqual(storage.readJSON("coretemp.json").cache, undefined);
      assert.strictEqual(timers.pendingCount(), 0);
    }
  },
  {
    name: "targeted disconnect BUSY retries are bounded and never use global disconnect",
    async fn() {
      for (const succeeds of [true, false]) {
        const { ble, env, timers } = createLoadedBLE({ timers: { manualReconnect: true } });
        await ble.connect();
        let attempts = 0;
        env.NRF.disconnect = () => { throw new Error("must not globally disconnect"); };
        env.gatt.disconnect = () => {
          attempts++;
          if (!succeeds || attempts < 3) throw new Error("ERR 0x11 (BUSY)");
          env.gatt.connected = false;
        };
        if (succeeds) await ble.disconnect();
        else await assert.rejects(ble.disconnect(), /BUSY/);
        assert.strictEqual(attempts, 3);
        assert.strictEqual(timers.hasReconnect(), false);
      }
    }
  }
);
