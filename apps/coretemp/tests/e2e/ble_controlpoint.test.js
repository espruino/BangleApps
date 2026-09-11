const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");
const fakeBLE = require("../helpers/fake_ble");

function tick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function createTimers(options) {
  const reconnectTimers = [];
  const profileUpgradeTimers = [];
  options = options || {};
  return {
    setTimeout(fn, ms) {
      if (ms === 2000 || ms === 3000 || ms === 4000) {
        Promise.resolve().then(fn);
        return -1;
      }
      if (options.manualReconnect && (ms === 5000 || ms === 10000 || ms === 30000)) {
        const timer = { fn, active: true };
        reconnectTimers.push(timer);
        return timer;
      }
      if (ms === 60000) {
        const timer = { fn, active: true };
        profileUpgradeTimers.push(timer);
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
    },
    runNextProfileUpgrade() {
      const timer = profileUpgradeTimers.shift();
      if (timer && timer.active) Promise.resolve().then(timer.fn);
    },
    hasProfileUpgrade() {
      return profileUpgradeTimers.some(timer => timer.active);
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
      btid: "core-1"
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
          readValue() { return Promise.resolve(); },
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
      assert.strictEqual(settings.enabled, false);
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
      assert.strictEqual(env.getPrimaryServicesCalls(), 0);
      assert.strictEqual(ble.getStatus().reconnectScheduled, true);
      assert.match(ble.getStatus().lastError, /Disconnected/);

      timers.runNextReconnect();
      await drain();

      assert.strictEqual(ble.getStatus().connected, true);
      assert.strictEqual(ble.getStatus().state, "connected");
    }
  },
  {
    name: "cached BUSY attach failure rebuilds cache while transport stays connected",
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

      assert.strictEqual(env.getPrimaryServicesCalls(), 1);
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
    name: "connect accepts standard health thermometer temperature without control point",
    async fn() {
      const { ble, protocol, env, emitted } = createLoadedBLE({
        fakeBLE: { healthThermometerOnly: true }
      });
      ble.init();
      await ble.connect();
      assert.strictEqual(ble.getStatus().connected, true);
      await assert.rejects(
        ble.writeControlPoint(protocol.OPCODES.HRM_PAIRED_COUNT, [], { timeoutMs: 20 }),
        /not connected/
      );

      env.healthThermometerChar.emitValue([0x00, 0x77, 0x01, 0x00, 0xFF]);

      const measurements = emitted.filter(e => e.name === "CORESensor");
      assert.strictEqual(measurements.length, 1);
      assert.strictEqual(measurements[0].data.core, 37.5);
      assert.strictEqual(measurements[0].data.profile, "health_thermometer");
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
    name: "health thermometer fallback schedules profile upgrade discovery",
    async fn() {
      const { ble, timers } = createLoadedBLE({
        fakeBLE: { healthThermometerOnly: true },
        timers: { manualProfileUpgrade: true, manualReconnect: true }
      });
      ble.init();
      await ble.connect();

      assert.strictEqual(ble.getStatus().profile, "health_thermometer");
      assert.strictEqual(ble.getStatus().profileUpgradeScheduled, true);
      assert.strictEqual(timers.hasProfileUpgrade(), true);

      timers.runNextProfileUpgrade();
      await drain();

      assert.strictEqual(ble.getStatus().desiredConnected, true);
    }
  },
  {
    name: "custom CORE profile does not schedule profile upgrade discovery",
    async fn() {
      const { ble, timers } = createLoadedBLE({
        timers: { manualProfileUpgrade: true }
      });
      ble.init();
      await ble.connect();

      assert.strictEqual(ble.getStatus().profile, "custom_core");
      assert.strictEqual(ble.getStatus().profileUpgradeScheduled, false);
      assert.strictEqual(timers.hasProfileUpgrade(), false);
    }
  },
  {
    name: "custom-only setting rejects standard health thermometer fallback",
    async fn() {
      const { ble, timers } = createLoadedBLE({
        fakeBLE: { healthThermometerOnly: true },
        settings: { customprofileonly: true },
        timers: { manualReconnect: true }
      });
      ble.init();
      await assert.rejects(
        ble.connect(),
        /Runtime discovery missing required CORE characteristics: missing 00002101-5b1e-4347-b07c-97b514dae121/
      );
      assert.strictEqual(ble.getStatus().reconnectScheduled, true);

      timers.runNextReconnect();
      await drain();
      assert.strictEqual(ble.getStatus().state, "reconnect_wait");
    }
  },
  {
    name: "custom-only setting ignores cached standard temperature fallback",
    async fn() {
      const { ble } = createLoadedBLE({
        fakeBLE: { healthThermometerOnly: true },
        timers: { manualReconnect: true },
        settings: {
          customprofileonly: true,
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
      const { ble, env } = createLoadedBLE({
        fakeBLE: { includeHealthThermometer: true }
      });
      ble.init();
      await ble.connect();

      assert.strictEqual(env.tempChar.notificationsStarted, true);
      assert.strictEqual(env.healthThermometerChar.notificationsStarted, undefined);
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
