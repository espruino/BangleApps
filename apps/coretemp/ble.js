var store = require("coretemp.store");
var protocol = require("coretemp.protocol");
var controlpoint = require("coretemp.controlpoint");

var SETTLE_MS = 2000;
var REBUILD_SETTLE_MS = 4000;
var BUSY_RETRIES = 3;
var RETRY_MIN_MS = 5000;
var RETRY_MAX_MS = 30000;
var transport;
var generation = 0;
var stopped = false;
// Intent is independent of owners: an explicit disconnect suppresses automatic
// connections until connect() or a subsequent complete power release/reacquire.
var intent = "released";
var pendingAction;
var pauseOwners = [];
var temporaryOwners = {};
var lifecycleQueue = Promise.resolve();
var activeTask;
var reconnectTimer;
var reconnectDelay = RETRY_MIN_MS;
var state = "idle";
var lastError;
var waits = [];

function log(message, value) { store.log(message, value); }
function wait(ms, token) {
  if (token !== undefined && token !== generation) {
    return Promise.reject(error("CORE operation superseded", "superseded"));
  }
  if (stopped) return Promise.resolve();
  return new Promise(function (resolve, reject) {
    var entry = { resolve: resolve, reject: reject, token: token };
    waits.push(entry);
    entry.timer = setTimeout(function () {
      var index = waits.indexOf(entry);
      if (index < 0) return;
      waits.splice(index, 1);
      resolve();
    }, ms);
  });
}
function cancelWaits(all) {
  waits = waits.filter(function (entry) {
    if (!all && entry.token === undefined) return true;
    clearTimeout(entry.timer);
    if (entry.token === undefined) entry.resolve();
    else entry.reject(error("CORE operation superseded", "superseded"));
    return false;
  });
}
function error(message, context) {
  var err = new Error(message);
  err.coreContext = context;
  return err;
}
function normalizeError(err) { return err instanceof Error ? err : new Error(String(err)); }
function isBusy(err) { return /in progress|0x11\b|\(BUSY\)/i.test(String(err)); }
function isPaused() { return pauseOwners.length > 0; }
function owners() { return (Bangle._PWR && Bangle._PWR.CORESensor) || []; }
function isTransient(owner) { return /^coretemp\.(settings|pair|rebuild)$/.test(owner); }
function isOn() {
  return owners().some(function (owner) { return store.get().enabled === true || isTransient(owner); });
}
function isConnected() { return !!(transport && transport.gatt && transport.gatt.connected); }
function wanted() { return !stopped && intent === "on" && isOn() && !isPaused(); }
function paired() { return !!(store.get().btid || store.get().btname); }
function ready() { return isConnected() && transport.ready && transport.token === generation; }

function emitStatus() {
  if (typeof Bangle.emit !== "function") return;
  try { Bangle.emit("CORESensorStatus", getStatus()); }
  catch (err) { log("CORE status listener failed", String(err)); }
}
function setState(next, reason) {
  state = next;
  log("CORE state -> " + next, reason);
  emitStatus();
}
function clearRetry() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = undefined;
}
function invalidate(reason) {
  generation++;
  if (transport) transport.ready = false;
  controlpoint.close("CORE transport closed: " + reason);
  cancelWaits(false);
}
function check(s) {
  if (stopped) throw error("CORE runtime stopped", "superseded");
  if (isPaused()) throw error("CORESensor paused", "paused");
  if (intent !== "on" || !isOn()) throw error("CORESensor power off", "power_off");
  if (s.disconnected) throw error("Disconnected during CORE operation", "connect");
  if (s !== transport || s.token !== generation) throw error("CORE operation superseded", "superseded");
}
function checkAction(action) {
  if (stopped || pendingAction !== action) throw error("CORE action superseded", "superseded");
}

// Track native operations so teardown can invalidate immediately but wait for
// the outstanding GATT operation before disconnecting. No overlapping BLE tasks.
function io(s, fn) {
  check(s);
  var operation = (s.io || Promise.resolve()).then(function () { check(s); return fn(); });
  s.io = operation.then(function () {}, function () {});
  return operation.then(function (result) { check(s); return result; });
}
function listen(s, object, event, fn) {
  var handler = function (value) {
    if (transport === s && s.token === generation && !stopped) fn(value);
  };
  object.on(event, handler);
  s.listeners.push({ object: object, event: event, handler: handler });
}
function detach(s) {
  s.listeners.forEach(function (entry) {
    if (entry.object.removeListener) entry.object.removeListener(entry.event, entry.handler);
  });
  s.listeners = [];
}
function disconnectGatt(s, attempt) {
  if (!s.gatt || !s.gatt.connected) return Promise.resolve();
  var result;
  // Invoke immediately so shutdown still attempts disconnection before unload.
  try { result = s.gatt.disconnect(); }
  catch (err) { result = Promise.reject(err); }
  return Promise.resolve(result).catch(function (err) {
    if (!stopped && isBusy(err) && attempt < BUSY_RETRIES) {
      return wait(SETTLE_MS).then(function () {
        if (!stopped) return disconnectGatt(s, attempt + 1);
      });
    }
    err = normalizeError(err);
    err.coreContext = "disconnect";
    throw err;
  });
}
function closeTransport(reason, settleMs) {
  var s = transport;
  if (!s) return Promise.resolve();
  clearRetry();
  invalidate(reason);
  detach(s);
  setState("disconnecting", reason);
  return (s.io || Promise.resolve()).then(function () {
    return disconnectGatt(s, 1);
  }).then(function () {
    if (transport === s) transport = undefined;
    store.flush();
    return wait(settleMs || SETTLE_MS);
  });
}

function scheduleRetry() {
  if (!wanted() || !paired() || pendingAction || reconnectTimer) return;
  var delay = reconnectDelay;
  reconnectDelay = Math.min(delay * 2, RETRY_MAX_MS);
  setState("reconnect_wait", delay);
  reconnectTimer = setTimeout(function () {
    reconnectTimer = undefined;
    if (wanted() && !pendingAction) background(requestAction("reconnect"));
  }, delay);
}
function background(promise) {
  promise.catch(function (err) { log("CORE background operation failed", String(err)); });
}
function onDisconnect(s, reason) {
  s.disconnected = true;
  lastError = "Disconnected: " + reason;
  log("Disconnect", reason);
  invalidate("disconnect");
  // Also queue this during readiness callbacks, where the active task may have
  // already finished its last GATT operation. Cleanup and retry are idempotent.
  background(enqueue("disconnect_event"));
}

function normalizeUuid(uuid) {
  var value = String(uuid || "").toLowerCase();
  if (value.length === 36 && value.indexOf("0000") === 0 &&
      value.indexOf("-0000-1000-8000-00805f9b34fb") === 8) return "0x" + value.substr(4, 4);
  return value;
}
function supported(characteristic) {
  return protocol.SUPPORTED_CHARACTERISTIC_UUIDS.indexOf(normalizeUuid(characteristic.uuid)) >= 0;
}
function findCharacteristic(chars, uuid) {
  for (var i = 0; i < chars.length; i++) if (normalizeUuid(chars[i].uuid) === uuid) return chars[i];
}
function requireTemperature(chars) {
  if (findCharacteristic(chars, protocol.CORE_TEMP_UUID)) return;
  var err = error("Runtime discovery missing required CORE characteristics: missing " +
    protocol.CORE_TEMP_UUID, "discover");
  err.coreDiscoveryMismatch = true;
  err.missingCharacteristics = [protocol.CORE_TEMP_UUID];
  throw err;
}
function cachedCharacteristics(s) {
  var cache = store.get().cache;
  if (!cache || !cache.characteristics) return [];
  var chars = [];
  Object.keys(cache.characteristics).forEach(function (key) {
    var cached = cache.characteristics[key];
    if (!supported(cached)) return;
    var characteristic = new BluetoothRemoteGATTCharacteristic();
    characteristic.uuid = normalizeUuid(cached.uuid);
    characteristic.handle_value = cached.handle;
    characteristic.service = { device: s.device };
    characteristic.properties = {
      notify: cached.notify, indicate: cached.indicate, read: cached.read, write: cached.write
    };
    chars.push(characteristic);
  });
  return findCharacteristic(chars, protocol.CORE_TEMP_UUID) ? chars : [];
}
function saveCache(s, target) {
  check(s);
  var cache = { characteristics: {} };
  s.chars.forEach(function (characteristic) {
    var uuid = normalizeUuid(characteristic.uuid);
    cache.characteristics[uuid] = Object.assign(
      { handle: characteristic.handle_value, uuid: uuid }, characteristic.properties);
  });
  store.write(function (settings) {
    settings.cache = cache;
    if (target) {
      settings.btid = target.id;
      if (target.name) settings.btname = target.name;
      else delete settings.btname;
    }
  });
}
function deleteCache() { store.write(function (settings) { delete settings.cache; }); }

function notification(s, characteristic, ev) {
  var uuid = normalizeUuid(characteristic.uuid);
  if (uuid === protocol.CORE_TEMP_UUID) {
    var data = protocol.parseMeasurement(ev.target.value, s.battery);
    log("data", data);
    Bangle.emit("CORESensor", data);
  } else if (uuid === protocol.CORE_CONTROL_POINT_UUID) {
    log("Control point response", protocol.dataViewToArray(ev.target.value));
    controlpoint.onNotification(ev.target.value);
  } else if (uuid === protocol.BATTERY_LEVEL_UUID) {
    s.battery = protocol.parseBattery(ev.target.value);
  }
}
function attach(s) {
  check(s);
  requireTemperature(s.chars);
  setState("attaching");
  var chain = Promise.resolve();
  s.chars.forEach(function (characteristic) {
    chain = chain.then(function () {
      check(s);
      var uuid = normalizeUuid(characteristic.uuid);
      var properties = characteristic.properties || {};
      listen(s, characteristic, "characteristicvaluechanged", function (ev) { notification(s, characteristic, ev); });
      var read = properties.read ? io(s, function () { return characteristic.readValue(); }) : Promise.resolve();
      return read.then(function (value) {
        check(s);
        if (properties.read && uuid === protocol.BATTERY_LEVEL_UUID) s.battery = protocol.parseBattery(value);
        if (properties.notify || properties.indicate || uuid === protocol.CORE_CONTROL_POINT_UUID) {
          log("Starting notifications", uuid);
          return io(s, function () { return characteristic.startNotifications(); }).then(function () {
            // Preserve the tested CCCD settle interval before another operation.
            return wait(3000);
          });
        }
      });
    });
  });
  return chain.then(function () {
    check(s);
    s.cp = findCharacteristic(s.chars, protocol.CORE_CONTROL_POINT_UUID);
    s.profile = s.cp ? "custom_core" : "custom_core_temperature";
    if (s.cp) controlpoint.setAdapter({
      write: function (bytes) { return io(s, function () { return s.cp.writeValue(new Uint8Array(bytes)); }); },
      log: log
    });
    s.ready = true;
  });
}
function discover(s) {
  check(s);
  setState("discovering");
  s.chars = [];
  function service(uuid) {
    log("Runtime discovery: getting service", uuid);
    // Explicit UUID lookup registers CORE's vendor base with Espruino. An
    // unfiltered service scan may report only 0x0000[vendor].
    return io(s, function () { return s.gatt.getPrimaryService(uuid); }).catch(function (err) {
      if (!/^(Error: )?No Services found$/.test(String(err))) throw err;
    }).then(function (found) {
      check(s);
      log("Runtime discovery service", { uuid: uuid, found: !!found });
      if (!found) return;
      return io(s, function () { return found.getCharacteristics(); }).then(function (chars) {
        (chars || []).forEach(function (characteristic) {
          log("Runtime discovery characteristic", {
            service: uuid, uuid: characteristic.uuid, accepted: supported(characteristic)
          });
          if (supported(characteristic)) s.chars.push(characteristic);
        });
      });
    });
  }
  return service(protocol.CORE_SERVICE_UUID).then(function () {
    requireTemperature(s.chars);
    return service(protocol.BATTERY_SERVICE_UUID);
  }).then(function () { s.discovered = true; return attach(s); });
}
function attachCachedOrDiscover(s, forceDiscovery) {
  s.chars = forceDiscovery ? [] : cachedCharacteristics(s);
  if (!s.chars.length) return discover(s);
  log("Read cached characteristics");
  return attach(s).catch(function (err) {
    // A BUSY stack says nothing about handle validity. Retry with the cache.
    if (isBusy(err)) throw err;
    if (!s.gatt.connected) throw error("Disconnected during cached attach", "connect");
    check(s);
    log("Cached characteristics failed, rebuilding cache", String(err));
    deleteCache();
    detach(s);
    listen(s, s.device, "gattserverdisconnected", function (reason) { onDisconnect(s, reason); });
    return discover(s);
  });
}

function openTransport(target) {
  if (!target && !paired()) return Promise.reject(error("CORE device is not paired", "no_pairing"));
  var s = { token: ++generation, listeners: [], chars: [], battery: 0, ready: false };
  transport = s;
  var settings = store.get();
  var id = target ? target.id : settings.btid;
  var scan;
  if (target && target.device) scan = Promise.resolve(target.device);
  else {
    setState("scanning");
    scan = io(s, function () {
      NRF.setScan();
      return NRF.requestDevice({ filters: id ? [{ id: id }] : [{ name: settings.btname }], active: true });
    }).then(function (found) { return wait(SETTLE_MS).then(function () { return found; }); });
  }
  return scan.then(function (found) {
    check(s);
    s.device = found;
    s.gatt = found.gatt;
    listen(s, found, "gattserverdisconnected", function (reason) { onDisconnect(s, reason); });
    if (s.gatt.connected) return;
    setState("connecting");
    return io(s, function () { return s.gatt.connect(); }).then(function () { return wait(SETTLE_MS); });
  }).then(function () {
    check(s);
    if (!s.gatt.connected) throw error("Disconnected before discovery", "connect");
    if (s.gatt.getSecurityStatus) {
      try { log("CORE security status", s.gatt.getSecurityStatus()); }
      catch (err) { log("CORE security status unavailable", String(err)); }
    }
    return attachCachedOrDiscover(s, !!target);
  }).then(function () {
    check(s);
    if (!s.gatt.connected) throw error("Disconnected before ready", "connect");
    if (!target && s.discovered) saveCache(s);
    if (!target && !settings.btid && settings.btname) {
      store.write(function (next) { if (next.btname === settings.btname && !next.btid) next.btid = s.device.id; });
    }
    lastError = undefined;
    reconnectDelay = RETRY_MIN_MS;
    if (!target) setState("connected");
  });
}
function connectWithRetry(target, action) {
  var attempts = 0;
  function attempt() {
    if (action) checkAction(action);
    attempts++;
    return openTransport(target).catch(function (err) {
      if (!isBusy(err) || !wanted() || attempts >= BUSY_RETRIES || (action && pendingAction !== action)) throw err;
      log("BLE stack busy", { attempt: attempts, error: String(err) });
      return closeTransport("stack busy").then(attempt);
    });
  }
  return attempt();
}
function reconcile(kind, action) {
  store.read();
  if (action) {
    checkAction(action);
    return closeTransport(action.kind, action.kind === "rebuild" ? REBUILD_SETTLE_MS : SETTLE_MS).then(function () {
      checkAction(action);
      if (action.kind === "unpair") {
        store.write(function (settings) {
          settings.alwaysOn = false;
          delete settings.btid;
          delete settings.btname;
          delete settings.cache;
        });
        if (Bangle._PWR) Bangle._PWR.CORESensor = [];
        intent = "released";
        lastError = undefined;
        setState("idle", "unpaired");
        return;
      }
      if (action.kind === "rebuild") deleteCache();
      return connectWithRetry(action.target, action).then(function () {
        checkAction(action);
        if (action.kind === "pair") {
          saveCache(transport, action.target);
          setState("connected");
        }
      });
    });
  }
  // Explicit actions run in their own queue slots; background requests cannot
  // consume or replace them, nor bypass an already scheduled retry delay.
  if (pendingAction) return Promise.resolve();
  if (!wanted()) return closeTransport(isPaused() ? "paused" : "power off").then(function () {
    if (!stopped) setState("idle");
  });
  if (kind === "disconnect_event") return closeTransport("disconnect").then(scheduleRetry);
  if (reconnectTimer || ready()) return Promise.resolve();
  return closeTransport("new connection").then(function () { return connectWithRetry(); });
}
function enqueue(kind, action) {
  var task = lifecycleQueue.then(function () {
    if (stopped) throw error("CORE runtime stopped", "superseded");
    activeTask = kind;
    log("Lifecycle task start", kind);
    return reconcile(kind, action);
  }).then(function (result) {
    if (action && pendingAction === action) pendingAction = undefined;
    return result;
  }, function (failure) {
    var err = normalizeError(failure);
    if (!err.coreContext) {
      err.coreContext = state === "discovering" || state === "attaching" ? state.replace(/ing$/, "") : "connect";
    }
    var cancelled = /^(superseded|power_off|paused)$/.test(err.coreContext);
    if (action && pendingAction === action) {
      pendingAction = undefined;
      if (action.kind === "pair") intent = "released";
    }
    if (stopped) throw err;
    if (!cancelled) {
      lastError = String(err);
      setState("error", err.coreContext);
    }
    var cleanup = err.coreContext === "disconnect" ? Promise.resolve() : closeTransport(err.coreContext);
    return cleanup.catch(function (closeError) {
      log("CORE cleanup failed", String(closeError));
    }).then(function () {
      if (!stopped) {
        setState("idle");
        if (!cancelled && kind !== "pair") scheduleRetry();
      }
      throw err;
    });
  });
  // Keep the queue fulfilled after failure, while each caller receives its own
  // rejection. Both outcomes use the same execution and cleanup path.
  lifecycleQueue = task.then(function () { activeTask = undefined; }, function () { activeTask = undefined; });
  return task;
}
function requestAction(kind, target) {
  var action = { kind: kind, target: target };
  pendingAction = action;
  intent = kind === "unpair" ? "released" : "on";
  clearRetry();
  invalidate(kind);
  return enqueue(kind, action);
}

function connect() {
  store.read();
  if (!isOn()) return Promise.reject(error("CORESensor has no power owner", "power_off"));
  if (!paired()) return Promise.reject(error("CORE device is not paired", "no_pairing"));
  if (pendingAction) {
    pendingAction = undefined;
    invalidate("connect requested");
  }
  clearRetry();
  intent = "on";
  return enqueue("connect");
}
function disconnect() {
  intent = "disconnect";
  pendingAction = undefined;
  clearRetry();
  invalidate("requested disconnect");
  return enqueue("disconnect");
}
function runWithTemporaryPower(owner, fn) {
  // Count overlapping internal leases without changing Bangle's idempotent
  // public owner API. A cancelled operation cannot release another's lease.
  var lease = temporaryOwners[owner];
  if (!lease) {
    lease = temporaryOwners[owner] = { count: 0, acquired: owners().indexOf(owner) < 0 };
    if (lease.acquired) setPower(1, owner);
  }
  lease.count++;
  function release() {
    if (--lease.count) return;
    delete temporaryOwners[owner];
    if (lease.acquired) setPower(0, owner);
  }
  return Promise.resolve().then(fn).then(function (result) {
    release();
    return result;
  }, function (err) {
    release();
    throw err;
  });
}
function runWithConnectedSession(owner, fn) {
  return runWithTemporaryPower(owner, function () { return connect().then(fn); });
}
function pairDevice(deviceOrId, name) {
  var target = typeof deviceOrId === "object" && deviceOrId ?
    { id: deviceOrId.id, name: deviceOrId.name, device: deviceOrId } : { id: deviceOrId, name: name };
  if (!target.id) return Promise.reject(new Error("Missing CORE device id"));
  return runWithTemporaryPower("coretemp.pair", function () { return requestAction("pair", target); });
}
function rebuildCache() {
  store.read();
  if (!paired()) return Promise.reject(new Error("CORE device is not paired"));
  return runWithTemporaryPower("coretemp.rebuild", function () { return requestAction("rebuild"); });
}
function pause(owner) {
  owner = owner || "?";
  if (pauseOwners.indexOf(owner) < 0) pauseOwners.push(owner);
  clearRetry();
  invalidate("paused");
  log("CORESensor pause", pauseOwners);
  return enqueue("pause");
}
function resume(owner) {
  owner = owner || "?";
  pauseOwners = pauseOwners.filter(function (item) { return item !== owner; });
  log("CORESensor resume", pauseOwners);
  return enqueue("resume");
}
function setPower(on, owner) {
  owner = owner || "?";
  if (on && store.read().enabled !== true && !isTransient(owner)) return;
  if (!Bangle._PWR) Bangle._PWR = {};
  if (!Bangle._PWR.CORESensor) Bangle._PWR.CORESensor = [];
  var wasOff = !isOn();
  var list = Bangle._PWR.CORESensor;
  if (on && list.indexOf(owner) < 0) list.push(owner);
  if (!on) Bangle._PWR.CORESensor = list.filter(function (item) { return item !== owner; });
  if (stopped) return;
  log("setCORESensorPower", { on: !!on, owner: owner });
  if (!isOn()) {
    intent = "released";
    clearRetry();
    invalidate("power off");
    background(enqueue("power_off"));
  } else if (!isTransient(owner)) {
    if (!(pendingAction && pendingAction.kind === "unpair") && (wasOff || intent !== "disconnect")) intent = "on";
    background(enqueue("power_on"));
  }
}
function applySettings() {
  var settings = store.read();
  var previous = owners();
  if (!settings.enabled) {
    if (settings.alwaysOn) store.write(function (next) { next.alwaysOn = false; });
    if (Bangle._PWR) Bangle._PWR.CORESensor = previous.filter(isTransient);
  }
  if (settings.enabled && settings.alwaysOn) {
    if (previous.indexOf("coretemp.enabled") < 0) setPower(1, "coretemp.enabled");
  } else if (previous.indexOf("coretemp.enabled") >= 0 || (previous.length && !isOn())) {
    setPower(0, "coretemp.enabled");
  }
  emitStatus();
}
function writeControlPoint(opcode, params, options, token) {
  if (token !== undefined && token !== generation) {
    return Promise.reject(error("CORE operation superseded", "superseded"));
  }
  if (!ready() || !transport.cp) return Promise.reject(new Error("CORE control point is not connected"));
  var s = transport;
  return controlpoint.request(opcode, params, options).then(function (response) {
    check(s);
    return response;
  }).catch(function (err) {
    if (err.coreTransportFailure && transport === s && s.token === generation) {
      lastError = String(err);
      invalidate("control point failure");
      if (wanted() && !pendingAction) background(enqueue("disconnect_event"));
    }
    throw err;
  });
}
function getStatus() {
  var settings = store.read();
  return {
    enabled: settings.enabled === true,
    alwaysOn: settings.enabled === true && settings.alwaysOn === true,
    paired: paired(),
    deviceId: settings.btid,
    deviceName: settings.btname,
    state: state,
    connected: isConnected(),
    reconnectScheduled: !!reconnectTimer,
    profileUpgradeScheduled: false,
    customProfileOnly: true,
    hasCache: !!(settings.cache && settings.cache.characteristics),
    profile: transport && transport.profile,
    lastError: lastError,
    activeTask: activeTask,
    desiredConnected: intent === "on",
    pendingReconnect: !!reconnectTimer || !!(pendingAction && pendingAction.kind === "reconnect"),
    paused: isPaused(),
    pauseOwners: pauseOwners.slice()
  };
}

exports.init = function () { stopped = false; };
exports.isOn = isOn;
exports.isConnected = isConnected;
exports.connect = connect;
exports.disconnect = disconnect;
exports.pairDevice = pairDevice;
exports.unpairDevice = function () { return requestAction("unpair"); };
exports.rebuildCache = rebuildCache;
exports.writeControlPoint = writeControlPoint;
exports.getSessionToken = function () { return generation; };
exports.waitForSession = wait;
exports.getStatus = getStatus;
exports.setPower = setPower;
exports.applySettings = applySettings;
exports.pause = pause;
exports.resume = resume;
exports.isPaused = isPaused;
exports.runWithConnectedSession = runWithConnectedSession;
exports.shutdown = function () {
  stopped = true;
  intent = "released";
  pendingAction = undefined;
  pauseOwners = [];
  clearRetry();
  invalidate("kill");
  cancelWaits(true);
  var s = transport;
  transport = undefined;
  if (s) {
    detach(s);
    // The interpreter may be unloaded immediately; never schedule kill retries.
    background(disconnectGatt(s, BUSY_RETRIES));
    // A pending connect may finish after shutdown. Close that connection too,
    // without restarting the runtime or scheduling retries.
    if (s.io) background(s.io.then(function () { return disconnectGatt(s, BUSY_RETRIES); }));
  }
  store.flush();
};
