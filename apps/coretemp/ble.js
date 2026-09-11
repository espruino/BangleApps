var store = require("coretemp.store");
var protocol = require("coretemp.protocol");
var controlpoint = require("coretemp.controlpoint");

var CORE_STATE = {
  IDLE: "idle",
  SCANNING: "scanning",
  CONNECTING: "connecting",
  DISCOVERING: "discovering",
  ATTACHING: "attaching",
  CONNECTED: "connected",
  RECONNECT_WAIT: "reconnect_wait",
  DISCONNECTING: "disconnecting",
  ERROR: "error"
};

var RECONNECT_DELAY_MIN_MS = 5000;
var RECONNECT_DELAY_MAX_MS = 30000;
var BLE_SETTLE_DELAY_MS = 2000;
var BLE_REBUILD_SETTLE_DELAY_MS = 4000;
var BLE_BUSY_RETRY_LIMIT = 3;
var PROFILE_UPGRADE_RETRY_MS = 60000;

var initialized;
var gatt;
var device;
var characteristics = [];
var controlPointChar;
var reconnectTimer;
var reconnectDelayMs = RECONNECT_DELAY_MIN_MS;
var expectedDisconnectDevice;
var batteryLevel = 0;
var coreState = CORE_STATE.IDLE;
var lastError;
var lifecycleQueue = Promise.resolve();
var activeLifecycleTask;
var shouldBeConnected = false;
var pendingReconnect = false;
var pendingRebuildCache = false;
var pendingPairTarget;
var activePairTarget;
var pendingUnpair = false;
var pendingDisconnect = false;
var connectedHandlers = [];
var connectionSessionId = 0;
var activeProfile;
var profileUpgradeTimer;
var pauseOwners = [];

// BLE lifecycle is driven by desired state plus one-shot pending flags. Public
// actions enqueue a reconciliation pass instead of directly mutating transport.
function log(text, param) {
  store.log(text, param);
}

function notifyConnectedHandlers(sessionId) {
  var promise = Promise.resolve();
  connectedHandlers.forEach(function (handler) {
    promise = promise.then(function () {
      return handler(sessionId);
    }).catch(function (err) {
      log("CORE connected handler failed", err);
    });
  });
  return promise;
}

function readSettings() {
  return store.read();
}

function writeSettings(mutator) {
  return store.write(mutator);
}

function setCoreState(nextState, reason) {
  coreState = nextState;
  if (reason !== undefined) log("CORE state -> " + nextState, reason);
  else log("CORE state -> " + nextState);
  emitStatus();
}

function emitStatus() {
  if (typeof Bangle === "undefined" || typeof Bangle.emit !== "function") return;
  try {
    Bangle.emit("CORESensorStatus", getStatus());
  } catch (e) {
    log("CORESensorStatus emit failed", e);
  }
}

function waitingPromise(timeout) {
  return new Promise(function (resolve) {
    log("Start waiting for " + timeout);
    setTimeout(function () {
      log("Done waiting for " + timeout);
      resolve();
    }, timeout);
  });
}

function waitForBleSettle(reason) {
  log("Waiting for BLE settle", reason);
  return waitingPromise(BLE_SETTLE_DELAY_MS);
}

function waitForBleRebuildSettle(reason) {
  log("Waiting for BLE rebuild settle", reason);
  return waitingPromise(BLE_REBUILD_SETTLE_DELAY_MS);
}

function clearPowerOwners() {
  if (typeof Bangle === "undefined" || !Bangle._PWR) return;
  // setCORESensorPower follows Bangle's reference-counted owner convention.
  Bangle._PWR.CORESensor = [];
}

function standDownCoreRuntime() {
  clearReconnectTimer();
  clearProfileUpgradeTimer();
  pendingReconnect = false;
  shouldBeConnected = false;
  lastError = undefined;
  clearPowerOwners();
}

function eraseStoredPairing(disableBackground) {
  writeSettings(function (nextSettings) {
    if (disableBackground) nextSettings.enabled = false;
    delete nextSettings.btid;
    delete nextSettings.btname;
    delete nextSettings.cache;
  });
}

function resetReconnectBackoff() {
  reconnectDelayMs = RECONNECT_DELAY_MIN_MS;
}

function increaseReconnectBackoff() {
  reconnectDelayMs = Math.min(reconnectDelayMs * 2, RECONNECT_DELAY_MAX_MS);
}

function clearReconnectTimer() {
  if (!reconnectTimer) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = undefined;
  if (!shouldBeConnected) setCoreState(CORE_STATE.IDLE, "reconnect cancelled");
}

function clearProfileUpgradeTimer() {
  if (!profileUpgradeTimer) return;
  clearTimeout(profileUpgradeTimer);
  profileUpgradeTimer = undefined;
}

function isPaused() {
  return pauseOwners.length > 0;
}

function shouldAttemptProfileUpgrade() {
  // Some devices initially expose only the standard thermometer profile. Keep
  // that connection alive, then periodically rebuild discovery to pick up the
  // richer custom CORE profile when it becomes visible.
  return activeProfile === "health_thermometer" &&
    !isCustomProfileOnly() &&
    shouldBeConnected &&
    !isPaused() &&
    !pendingDisconnect &&
    !pendingUnpair &&
    isOn();
}

function scheduleProfileUpgrade() {
  if (profileUpgradeTimer || !shouldAttemptProfileUpgrade()) return;
  log("Scheduling CORE profile upgrade", PROFILE_UPGRADE_RETRY_MS);
  profileUpgradeTimer = setTimeout(function () {
    profileUpgradeTimer = undefined;
    if (!shouldAttemptProfileUpgrade()) return;
    enqueueLifecycle("profile_upgrade", function () {
      pendingReconnect = false;
      pendingRebuildCache = true;
    }).catch(function (err) {
      log("CORE profile upgrade failed", err);
    });
  }, PROFILE_UPGRADE_RETRY_MS);
}

function logSecurityStatus(currentGatt) {
  var status;
  if (!currentGatt || !currentGatt.getSecurityStatus) return Promise.resolve();
  try {
    status = currentGatt.getSecurityStatus();
  } catch (e) {
    log("Unable to read CORE security status", e);
    return Promise.resolve();
  }
  log("CORE security status", status);
  return Promise.resolve();
}

function isBleTransportError(err) {
  var msg = String(err);
  return msg.indexOf("GATT") >= 0 ||
    msg.indexOf("Disconnected") >= 0 ||
    msg.indexOf("disconnected") >= 0 ||
    msg.indexOf("not connected") >= 0;
}

function isBleBusyError(err) {
  var msg = String(err).toLowerCase();
  return msg.indexOf("in progress") >= 0;
}

function normalizeUuid(uuid) {
  var normalized = uuid === undefined || uuid === null ? "" : String(uuid).toLowerCase();
  if (normalized.length === 36 &&
    normalized.indexOf("0000") === 0 &&
    normalized.indexOf("-0000-1000-8000-00805f9b34fb") === 8) {
    return "0x" + normalized.substr(4, 4);
  }
  return normalized;
}

function isCustomProfileOnly() {
  return store.get().customprofileonly === true;
}

function isSupportedService(uuid) {
  // customprofileonly is a diagnostic escape hatch: ignore the fallback
  // Health Thermometer profile so discovery failures expose custom-profile bugs.
  if (isCustomProfileOnly() && normalizeUuid(uuid) === protocol.HEALTH_THERMOMETER_SERVICE_UUID) return false;
  return protocol.SUPPORTED_SERVICES.indexOf(normalizeUuid(uuid)) >= 0;
}

function isSupportedCharacteristic(uuid) {
  if (isCustomProfileOnly() && normalizeUuid(uuid) === protocol.TEMPERATURE_MEASUREMENT_UUID) return false;
  return protocol.SUPPORTED_CHARACTERISTIC_UUIDS.indexOf(normalizeUuid(uuid)) >= 0;
}

function characteristicProperties(characteristic) {
  var properties = characteristic.properties || {};
  return {
    notify: !!properties.notify,
    indicate: !!properties.indicate,
    read: !!properties.read,
    write: !!properties.write
  };
}

function describeCharacteristicRole(uuid) {
  uuid = normalizeUuid(uuid);
  if (uuid === protocol.CORE_TEMP_UUID) return "custom_core_temperature";
  if (uuid === protocol.TEMPERATURE_MEASUREMENT_UUID) return "health_thermometer_temperature";
  if (uuid === protocol.CORE_CONTROL_POINT_UUID) return "custom_core_control_point";
  if (uuid === protocol.BATTERY_LEVEL_UUID) return "battery_level";
  return "unknown";
}

function missingRequiredCoreCharacteristics(chars) {
  var hasTemp = false;
  var customOnly = isCustomProfileOnly();
  chars.forEach(function (characteristic) {
    var uuid = normalizeUuid(characteristic.uuid);
    if (uuid === protocol.CORE_TEMP_UUID || (!customOnly && uuid === protocol.TEMPERATURE_MEASUREMENT_UUID)) hasTemp = true;
  });
  var missing = [];
  if (!hasTemp) missing.push(customOnly ? protocol.CORE_TEMP_UUID : protocol.CORE_TEMP_UUID + " or " + protocol.TEMPERATURE_MEASUREMENT_UUID);
  return missing;
}

function getCharacteristicsProfile(chars) {
  var hasCustomTemperature = false;
  var hasHealthThermometer = false;
  var hasControlPoint = false;
  chars.forEach(function (characteristic) {
    var uuid = normalizeUuid(characteristic.uuid);
    if (uuid === protocol.CORE_TEMP_UUID) hasCustomTemperature = true;
    if (uuid === protocol.TEMPERATURE_MEASUREMENT_UUID) hasHealthThermometer = true;
    if (uuid === protocol.CORE_CONTROL_POINT_UUID) hasControlPoint = true;
  });
  if (hasCustomTemperature && hasControlPoint) return "custom_core";
  if (hasCustomTemperature) return "custom_core_temperature";
  if (hasHealthThermometer) return "health_thermometer";
  return undefined;
}

function makeDiscoveryMismatchError(prefix, chars) {
  var missing = missingRequiredCoreCharacteristics(chars);
  var err = new Error(prefix + ": missing " + missing.join(", "));
  err.coreContext = "discover";
  err.coreDiscoveryMismatch = true;
  err.missingCharacteristics = missing;
  return err;
}

function setControlPointCharacteristic(characteristic) {
  controlPointChar = characteristic;
  if (!controlPointChar) {
    controlpoint.setAdapter(undefined);
    return;
  }
  controlpoint.setAdapter({
    write: function (bytes) {
      return controlPointChar.writeValue(new Uint8Array(bytes));
    },
    log: log
  });
}

function addNotificationHandler(characteristic) {
  var uuid = normalizeUuid(characteristic.uuid);
  // Cached characteristics can be reattached across reconnects; mark the object
  // so repeated attach attempts do not register duplicate notification handlers.
  if (characteristic._coretempHandlerAdded) return;
  characteristic._coretempHandlerAdded = true;
  characteristic.on("characteristicvaluechanged", function (ev) {
    if (uuid === protocol.CORE_TEMP_UUID) {
      var data = protocol.parseMeasurement(ev.target.value, batteryLevel);
      log("data", data);
      Bangle.emit("CORESensor", data);
    } else if (uuid === protocol.TEMPERATURE_MEASUREMENT_UUID) {
      var tempData = protocol.parseTemperatureMeasurement(ev.target.value, batteryLevel);
      log("data", tempData);
      Bangle.emit("CORESensor", tempData);
    } else if (uuid === protocol.CORE_CONTROL_POINT_UUID) {
      log("Control point response", protocol.dataViewToArray(ev.target.value));
      controlpoint.onNotification(ev.target.value);
    } else if (uuid === protocol.BATTERY_LEVEL_UUID) {
      batteryLevel = protocol.parseBattery(ev.target.value);
      log("Got battery", batteryLevel);
    }
  });
}

function characteristicsFromCache(currentDevice) {
  var cache = store.get().cache;
  var restored = [];
  var service = { device: currentDevice };
  var cached;
  var characteristic;
  var uuid;
  if (!cache || !cache.characteristics) return restored;
  log("Read cached characteristics");
  // Espruino exposes BluetoothRemoteGATTCharacteristic enough for handle-based
  // reconstruction, avoiding full service discovery on every reconnect.
  for (uuid in cache.characteristics) {
    if (!cache.characteristics.hasOwnProperty(uuid)) continue;
    cached = cache.characteristics[uuid];
    characteristic = new BluetoothRemoteGATTCharacteristic();
    characteristic.handle_value = cached.handle;
    characteristic.uuid = normalizeUuid(cached.uuid);
    characteristic.properties = {
      notify: cached.notify,
      indicate: cached.indicate,
      read: cached.read,
      write: cached.write
    };
    characteristic.service = service;
    addNotificationHandler(characteristic);
    restored.push(characteristic);
  }
  restored = preferCustomCoreTemperature(restored);
  if (!hasRequiredCoreCharacteristics(restored)) {
    log("Cached characteristics do not satisfy current profile settings", {
      profile: getCharacteristicsProfile(restored),
      customOnly: isCustomProfileOnly()
    });
    return [];
  }
  return restored;
}

function saveCache(chars) {
  writeSettings(function (nextSettings) {
    var cache = { characteristics: {} };
    chars.forEach(function (characteristic) {
      var uuid = normalizeUuid(characteristic.uuid);
      cache.characteristics[uuid] = {
        handle: characteristic.handle_value,
        uuid: uuid,
        notify: characteristic.properties.notify,
        indicate: characteristic.properties.indicate,
        read: characteristic.properties.read,
        write: characteristic.properties.write
      };
    });
    nextSettings.cache = cache;
  });
}

function deleteCache() {
  writeSettings(function (nextSettings) {
    delete nextSettings.cache;
  });
}

function hasRequiredCoreCharacteristics(chars) {
  return missingRequiredCoreCharacteristics(chars).length === 0;
}

function preferCustomCoreTemperature(chars) {
  var hasCustomTemperature = false;
  var customOnly = isCustomProfileOnly();
  chars.forEach(function (characteristic) {
    if (normalizeUuid(characteristic.uuid) === protocol.CORE_TEMP_UUID) hasCustomTemperature = true;
  });
  if (!customOnly && !hasCustomTemperature) return chars;
  // Prefer the custom CORE stream whenever present; the standard Health
  // Thermometer value lacks skin temp, HR, heat flux, HSI, and quality bits.
  return chars.filter(function (characteristic) {
    var uuid = normalizeUuid(characteristic.uuid);
    if (customOnly && uuid === protocol.TEMPERATURE_MEASUREMENT_UUID) {
      log("Skipping standard temperature measurement because custom CORE profile is required");
      return false;
    }
    if (hasCustomTemperature && uuid === protocol.TEMPERATURE_MEASUREMENT_UUID) {
      log("Skipping standard temperature measurement because custom CORE temperature is available");
      return false;
    }
    return true;
  });
}

function isTransportReady() {
  return !!(gatt && gatt.connected && hasRequiredCoreCharacteristics(characteristics));
}

function createCharacteristicPromise(characteristic) {
  var result = Promise.resolve();
  var supportsUpdates;
  var uuid = normalizeUuid(characteristic.uuid);
  if (uuid === protocol.CORE_CONTROL_POINT_UUID) setControlPointCharacteristic(characteristic);
  supportsUpdates = uuid === protocol.CORE_CONTROL_POINT_UUID ||
    (characteristic.properties &&
      (characteristic.properties.notify || characteristic.properties.indicate));
  if (characteristic.properties && characteristic.properties.read) {
    result = result.then(function () {
      log("Reading characteristic", { uuid: uuid, role: describeCharacteristicRole(uuid) });
      return characteristic.readValue().then(function (data) {
        if (uuid === protocol.BATTERY_LEVEL_UUID) batteryLevel = protocol.parseBattery(data);
      });
    });
  }
  if (supportsUpdates) {
    result = result.then(function () {
      log("Starting notifications", { uuid: uuid, role: describeCharacteristicRole(uuid) });
      return characteristic.startNotifications()
        .then(function () {
          log("Notifications started", { uuid: uuid, role: describeCharacteristicRole(uuid) });
        })
        .then(function () {
          // Give the watch BLE stack time to finish enabling CCCDs before the
          // next characteristic operation; without this, writes can race setup.
          return waitingPromise(3000);
        });
    });
  }
  return result;
}

function attachCharacteristics() {
  var promise = Promise.resolve();
  setCoreState(CORE_STATE.ATTACHING);
  activeProfile = getCharacteristicsProfile(characteristics);
  log("Attaching CORE profile", activeProfile);
  characteristics.forEach(function (characteristic) {
    promise = promise.then(function () {
      addNotificationHandler(characteristic);
      return createCharacteristicPromise(characteristic);
    });
  });
  return promise.then(function () {
    if (!hasRequiredCoreCharacteristics(characteristics)) {
      throw makeDiscoveryMismatchError("Missing required CORE characteristics", characteristics);
    }
  });
}

function assertGattConnectedForDiscovery(currentGatt) {
  if (!currentGatt || !currentGatt.connected) {
    var err = new Error("Disconnected before discovery fallback");
    err.coreContext = "connect";
    throw err;
  }
  return currentGatt;
}

function discoverCharacteristics(currentGatt) {
  currentGatt = assertGattConnectedForDiscovery(currentGatt);
  setCoreState(CORE_STATE.DISCOVERING);
  characteristics = [];
  setControlPointCharacteristic(undefined);
  log("Runtime discovery: getting services");
  return currentGatt.getPrimaryServices().then(function (services) {
    var promise = Promise.resolve();
    log("Runtime discovery: got services", services.length);
    services.forEach(function (service) {
      var serviceUuid = normalizeUuid(service.uuid);
      var serviceSupported = isSupportedService(serviceUuid);
      log("Runtime discovery service", { uuid: serviceUuid, supported: serviceSupported });
      if (!serviceSupported) return;
      promise = promise.then(function () {
        return service.getCharacteristics().then(function (chars) {
          chars.forEach(function (characteristic) {
            var uuid = normalizeUuid(characteristic.uuid);
            var accepted = isSupportedCharacteristic(uuid);
            log("Runtime discovery characteristic", {
              service: serviceUuid,
              uuid: uuid,
              role: describeCharacteristicRole(uuid),
              accepted: accepted,
              properties: characteristicProperties(characteristic)
            });
            if (!accepted) return;
            characteristics.push(characteristic);
          });
        });
      });
    });
    return promise;
  }).then(function () {
    characteristics = preferCustomCoreTemperature(characteristics);
    if (!hasRequiredCoreCharacteristics(characteristics)) {
      throw makeDiscoveryMismatchError("Runtime discovery missing required CORE characteristics", characteristics);
    }
    return attachCharacteristics();
  }).then(function () {
    saveCache(characteristics);
  });
}

function attachCachedOrDiscover() {
  var usedCache = false;
  var currentGatt = gatt;
  // Pairing deliberately bypasses saved handles because the target device may
  // differ from the previously paired CORE.
  if (activePairTarget) return discoverCharacteristics(currentGatt);
  if (!characteristics.length) {
    characteristics = characteristicsFromCache(device);
    usedCache = characteristics.length > 0;
  }
  if (!characteristics.length) return discoverCharacteristics(currentGatt);
  return attachCharacteristics().catch(function (err) {
    if (!usedCache) throw err;
    log("Cached characteristics failed, evaluating discovery fallback", err);
    assertGattConnectedForDiscovery(currentGatt);
    log("Cached characteristics failed, rebuilding cache", err);
    deleteCache();
    characteristics = [];
    setControlPointCharacteristic(undefined);
    return discoverCharacteristics(currentGatt);
  });
}

function resetTransportState(reason) {
  log("resetTransportState", reason);
  store.flush();
  clearProfileUpgradeTimer();
  controlpoint.cancelActive("CORE transport closed: " + reason);
  setControlPointCharacteristic(undefined);
  characteristics = [];
  batteryLevel = 0;
  activeProfile = undefined;
  // A future requestDevice call may return the same object; allow its disconnect
  // handler to be installed again after transport state is rebuilt.
  if (device) device._coretempDisconnectHandlerAdded = false;
  gatt = undefined;
  device = undefined;
}

function cleanupGatt(reason) {
  var currentGatt = gatt;
  var currentDevice = device;
  log("cleanupGatt", reason);
  resetTransportState(reason);
  if (currentGatt && currentGatt.connected) {
    expectedDisconnectDevice = currentDevice;
    try {
      currentGatt.disconnect();
    } catch (e) {
      log("cleanup disconnect error", e);
      try {
        NRF.disconnect();
      } catch (e2) {
        log("cleanup NRF.disconnect error", e2);
      }
    }
  }
}

function scheduleReconnect(reason) {
  // Capture the current delay before increasing it so the first retry is quick
  // while subsequent failures back off up to RECONNECT_DELAY_MAX_MS.
  var delay = reconnectDelayMs;
  if (isPaused()) {
    clearReconnectTimer();
    pendingReconnect = false;
    setCoreState(CORE_STATE.IDLE, "paused");
    return;
  }
  if (reconnectTimer || !shouldBeConnected || pendingDisconnect || pendingUnpair) return;
  increaseReconnectBackoff();
  pendingReconnect = true;
  setCoreState(CORE_STATE.RECONNECT_WAIT, delay);
  reconnectTimer = setTimeout(function () {
    reconnectTimer = undefined;
    if (shouldBeConnected && !isPaused() && !pendingDisconnect && !pendingUnpair) {
      enqueueLifecycle("reconnect", function () {
        pendingReconnect = true;
      }).catch(function (e) {
        log("Reconnect task failed", e);
      });
    } else {
      setCoreState(CORE_STATE.IDLE, reason || "power released before reconnect");
    }
  }, delay);
}

function enqueueLifecycle(kind, mutator) {
  if (mutator) mutator();
  // Serialize lifecycle work. BLE connect/disconnect/discovery operations are
  // fragile when overlapped, and each queued pass reconciles the latest flags.
  lifecycleQueue = lifecycleQueue.then(function () {
    activeLifecycleTask = { kind: kind };
    log("Lifecycle task start", kind);
    return reconcileLifecycle(kind).then(function (result) {
      activeLifecycleTask = undefined;
      log("Lifecycle task done", kind);
      return result;
    }, function (err) {
      activeLifecycleTask = undefined;
      log("Lifecycle task error", { kind: kind, error: String(err) });
      throw err;
    });
  }, function () {
    activeLifecycleTask = { kind: kind };
    return reconcileLifecycle(kind).then(function (result) {
      activeLifecycleTask = undefined;
      return result;
    }, function (err) {
      activeLifecycleTask = undefined;
      throw err;
    });
  });
  return lifecycleQueue;
}

function ensureConnectionDesiredOrThrow(stage) {
  var powerErr;
  if (isPaused()) {
    powerErr = new Error("CORESensor paused before " + stage);
    powerErr.coreContext = "paused";
    throw powerErr;
  }
  if (!shouldBeConnected || pendingDisconnect || pendingUnpair) {
    powerErr = new Error("CORESensor power off before " + stage);
    powerErr.coreContext = "power_off";
    throw powerErr;
  }
}

function ensureDisconnectHandler(bleDevice) {
  if (!bleDevice || bleDevice._coretempDisconnectHandlerAdded) return bleDevice;
  bleDevice._coretempDisconnectHandlerAdded = true;
  bleDevice.on("gattserverdisconnected", function (reason) {
    onDisconnect(bleDevice, reason);
  });
  return bleDevice;
}

function ensureDeviceAvailable() {
  var filters;
  var targetId;
  ensureConnectionDesiredOrThrow("connect");
  if (device) {
    ensureDisconnectHandler(device);
    log("Reuse device", device);
    return Promise.resolve(device);
  }
  setCoreState(CORE_STATE.SCANNING);
  NRF.setScan();
  targetId = activePairTarget && activePairTarget.id ? activePairTarget.id : store.get().btid;
  filters = [{ id: targetId }];
  return NRF.requestDevice({ filters: filters, active: true })
    .then(function (foundDevice) {
      return waitingPromise(2000).then(function () {
        return foundDevice;
      });
    })
    .then(function (foundDevice) {
      device = ensureDisconnectHandler(foundDevice);
      return foundDevice;
    }, function (err) {
      err.coreContext = "request_device";
      throw err;
    });
}

function ensureGattConnected() {
  ensureConnectionDesiredOrThrow("connect");
  if (!device) {
    var err = new Error("CORE device is unavailable");
    err.coreContext = "connect";
    throw err;
  }
  gatt = device.gatt;
  if (gatt.connected) {
    if (expectedDisconnectDevice === device) expectedDisconnectDevice = undefined;
    return logSecurityStatus(gatt);
  }
  setCoreState(CORE_STATE.CONNECTING);
  return gatt.connect()
    .then(function () {
      if (expectedDisconnectDevice === device) expectedDisconnectDevice = undefined;
      return waitingPromise(2000);
    })
    .then(function () {
      return logSecurityStatus(gatt);
    }, function (err) {
      if (!err.coreContext) err.coreContext = "connect";
      throw err;
    });
}

function ensureTransportReady() {
  ensureConnectionDesiredOrThrow("attach");
  if (isTransportReady()) {
    setCoreState(CORE_STATE.CONNECTED, "transport already ready");
    return Promise.resolve();
  }
  return attachCachedOrDiscover();
}

function performConnectSequence() {
  return ensureDeviceAvailable()
    .then(ensureGattConnected)
    .then(ensureTransportReady)
    .then(function () {
      lastError = undefined;
      pendingReconnect = false;
      resetReconnectBackoff();
      connectionSessionId++;
      setCoreState(CORE_STATE.CONNECTED);
      scheduleProfileUpgrade();
      return notifyConnectedHandlers(connectionSessionId);
    })
    .catch(function (err) {
      if (String(err).indexOf("power off") >= 0) err.coreContext = "power_off";
      else if (!err.coreContext && coreState === CORE_STATE.DISCOVERING) err.coreContext = "discover";
      else if (!err.coreContext && coreState === CORE_STATE.ATTACHING) err.coreContext = "attach";
      else if (!err.coreContext) err.coreContext = "connect";
      throw err;
    });
}

function handleLifecycleFailure(err) {
  var context = err.coreContext || "connect";
  var isPairAttempt = !!activePairTarget || !!(activeLifecycleTask && activeLifecycleTask.kind === "pair");
  var settings = store.get();
  lastError = String(err);
  log("BLE failure", { context: context, error: lastError });
  setCoreState(CORE_STATE.ERROR, context);
  if (isPairAttempt) {
    shouldBeConnected = false;
    pendingReconnect = false;
    clearReconnectTimer();
  }
  if (context === "no_pairing") {
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    pendingReconnect = false;
    setCoreState(CORE_STATE.IDLE, context);
    throw err;
  }
  if (context === "power_off") {
    clearReconnectTimer();
    cleanupGatt(context);
    return waitForBleSettle(context).then(function () {
      setCoreState(CORE_STATE.IDLE, context);
      throw err;
    });
  }
  if (context === "paused") {
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    pendingReconnect = false;
    cleanupGatt(context);
    return waitForBleSettle(context).then(function () {
      setCoreState(CORE_STATE.IDLE, context);
      throw err;
    });
  }
  cleanupGatt(context);
  return waitForBleSettle(context).then(function () {
    if (isPairAttempt) {
      pendingReconnect = false;
      clearReconnectTimer();
      setCoreState(CORE_STATE.IDLE, context);
    } else if (shouldBeConnected && !isPaused() && !pendingDisconnect && !pendingUnpair && settings.btid) {
      scheduleReconnect(context);
    } else {
      pendingReconnect = false;
      clearReconnectTimer();
      setCoreState(CORE_STATE.IDLE, context);
    }
    throw err;
  });
}

function performBusyRetry(attempt, err) {
  lastError = String(err);
  log("BLE stack busy", { attempt: attempt, error: lastError });
  setCoreState(CORE_STATE.ERROR, "stack busy");
  cleanupGatt("stack busy");
  return waitForBleSettle("stack busy");
}

function reconcileLifecycle(kind) {
  var settings = readSettings();
  if (pendingUnpair) {
    standDownCoreRuntime();
    setCoreState(CORE_STATE.DISCONNECTING, "unpair");
    cleanupGatt("unpair");
    return waitForBleSettle("unpair").then(function () {
      eraseStoredPairing(true);
      standDownCoreRuntime();
      pendingUnpair = false;
      pendingDisconnect = false;
      pendingPairTarget = undefined;
      pendingRebuildCache = false;
      setCoreState(CORE_STATE.IDLE, "unpaired");
    });
  }
  if (pendingDisconnect) {
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    pendingReconnect = false;
    shouldBeConnected = false;
    setCoreState(CORE_STATE.DISCONNECTING, "requested disconnect");
    cleanupGatt("requested disconnect");
    return waitForBleSettle("requested disconnect").then(function () {
      pendingDisconnect = false;
      setCoreState(CORE_STATE.IDLE, "requested disconnect");
    });
  }
  if (isPaused()) {
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    pendingReconnect = false;
    if (gatt || device) {
      setCoreState(CORE_STATE.DISCONNECTING, "paused");
      cleanupGatt("paused");
      return waitForBleSettle("paused").then(function () {
        setCoreState(CORE_STATE.IDLE, "paused");
      });
    }
    setCoreState(CORE_STATE.IDLE, "paused");
    return Promise.resolve();
  }
  if (pendingPairTarget) {
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    pendingReconnect = false;
    shouldBeConnected = true;
    setCoreState(CORE_STATE.DISCONNECTING, "pair target");
    cleanupGatt("pair target");
    return waitForBleSettle("pair target").then(function () {
      // Move the pending target into activePairTarget for the duration of
      // discovery so cache use and status handling know this is a pair attempt.
      var pairTarget = pendingPairTarget;
      pendingPairTarget = undefined;
      activePairTarget = pairTarget;
      if (pairTarget && pairTarget.device) device = pairTarget.device;
      pendingRebuildCache = false;
      return connectWithBusyRetry().then(function (result) {
        writeSettings(function (nextSettings) {
          nextSettings.btid = pairTarget.id;
          if (pairTarget.name) nextSettings.btname = pairTarget.name;
          else delete nextSettings.btname;
        });
        activePairTarget = undefined;
        return result;
      }, function (err) {
        activePairTarget = undefined;
        throw err;
      });
    });
  }
  if (pendingRebuildCache) {
    clearReconnectTimer();
    pendingReconnect = false;
    shouldBeConnected = true;
    setCoreState(CORE_STATE.DISCONNECTING, "rebuild cache");
    cleanupGatt("rebuild cache");
    deleteCache();
    return waitForBleRebuildSettle("rebuild cache").then(function () {
      pendingRebuildCache = false;
      return connectWithBusyRetry();
    });
  }
  if (pendingReconnect) {
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    setCoreState(CORE_STATE.DISCONNECTING, "reconnect requested");
    cleanupGatt("reconnect requested");
    return waitForBleSettle("reconnect requested").then(function () {
      return connectWithBusyRetry();
    }).then(function (result) {
      pendingReconnect = false;
      return result;
    });
  }
  if (!shouldBeConnected) {
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    if (gatt || device) {
      setCoreState(CORE_STATE.DISCONNECTING, "no connection requested");
      cleanupGatt("no connection requested");
      return waitForBleSettle("no connection requested").then(function () {
        setCoreState(CORE_STATE.IDLE, "no connection requested");
      });
    }
    setCoreState(CORE_STATE.IDLE, "no connection requested");
    return Promise.resolve();
  }
  if (!settings.btid) {
    pendingReconnect = false;
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    lastError = "CORE device is not paired";
    setCoreState(CORE_STATE.IDLE, "no_pairing");
    if (kind === "connect" || kind === "power_on" || kind === "reconnect") {
      var pairErr = new Error("CORE device is not paired");
      pairErr.coreContext = "no_pairing";
      throw pairErr;
    }
    return Promise.resolve();
  }
  return connectWithBusyRetry();
}

function connectWithBusyRetry() {
  var attempts = 0;
  function attemptConnect() {
    attempts++;
    return performConnectSequence().catch(function (err) {
      if (isBleBusyError(err) && shouldBeConnected && !isPaused() && attempts < BLE_BUSY_RETRY_LIMIT) {
        return performBusyRetry(attempts, err).then(attemptConnect);
      }
      return handleLifecycleFailure(err);
    });
  }
  return attemptConnect();
}

function isTransientOwner(owner) {
  return owner === "coretemp.settings" ||
    owner === "coretemp.pair" ||
    owner === "coretemp.rebuild";
}

function isOn() {
  return !!(Bangle._PWR && Bangle._PWR.CORESensor && Bangle._PWR.CORESensor.length);
}

function isConnected() {
  return !!(gatt && gatt.connected);
}

function runWithTemporaryPower(owner, fn) {
  var acquiredPower = false;
  var promise;
  // Settings/debug actions need a live connection but should not leave the
  // sensor powered after they finish unless another owner already held power.
  if (!isOn()) {
    setPower(1, owner);
    acquiredPower = true;
  }
  try {
    promise = Promise.resolve(fn());
  } catch (e) {
    promise = Promise.reject(e);
  }
  return promise.then(function (result) {
    if (acquiredPower) setPower(0, owner);
    return result;
  }, function (err) {
    if (acquiredPower) setPower(0, owner);
    throw err;
  });
}

function onDisconnect(disconnectedDevice, reason) {
  // cleanupGatt intentionally disconnects; ignore that event so requested
  // disconnects do not schedule a reconnect.
  if (expectedDisconnectDevice && expectedDisconnectDevice === disconnectedDevice) {
    expectedDisconnectDevice = undefined;
    log("Ignoring expected disconnect", reason);
    return;
  }
  log("Disconnect", reason);
  lastError = "Disconnected: " + reason;
  resetTransportState("disconnect");
  if (shouldBeConnected && !isPaused() && !pendingDisconnect && !pendingUnpair && isOn()) {
    scheduleReconnect("disconnect");
  } else {
    pendingReconnect = false;
    clearReconnectTimer();
    setCoreState(CORE_STATE.IDLE, "disconnect while off");
  }
}

function requestTransportReconnect(reason, err) {
  log("Request transport reconnect", { reason: reason, error: String(err) });
  lastError = String(err);
  if (!shouldBeConnected || isPaused() || pendingDisconnect || pendingUnpair || !isOn()) return;
  pendingReconnect = true;
  enqueueLifecycle("transport_recovery", function () {
    pendingReconnect = true;
  }).catch(function (queueErr) {
    log("Transport recovery failed", queueErr);
  });
}

function connect() {
  readSettings();
  if (!isOn()) return Promise.reject(new Error("CORESensor has no power owner"));
  if (!store.get().btid) return Promise.reject(new Error("CORE device is not paired"));
  if (isPaused()) {
    clearReconnectTimer();
    pendingReconnect = false;
    setCoreState(CORE_STATE.IDLE, "paused");
    return Promise.resolve();
  }
  return enqueueLifecycle("connect", function () {
    pendingDisconnect = false;
    pendingUnpair = false;
    pendingReconnect = false;
    shouldBeConnected = true;
  });
}

function disconnect() {
  return enqueueLifecycle("disconnect", function () {
    clearReconnectTimer();
    pendingReconnect = false;
    pendingDisconnect = true;
    shouldBeConnected = false;
  });
}

function pairDevice(deviceOrId, deviceName) {
  var pairTarget;
  if (deviceOrId && typeof deviceOrId === "object") {
    if (!deviceOrId.id) return Promise.reject(new Error("Missing CORE device id"));
    pairTarget = {
      id: deviceOrId.id,
      name: deviceOrId.name,
      device: deviceOrId
    };
  } else {
    if (!deviceOrId) return Promise.reject(new Error("Missing CORE device id"));
    pairTarget = {
      id: deviceOrId,
      name: deviceName
    };
  }
  return runWithTemporaryPower("coretemp.pair", function () {
    return enqueueLifecycle("pair", function () {
      clearReconnectTimer();
      pendingReconnect = false;
      pendingDisconnect = false;
      pendingUnpair = false;
      pendingRebuildCache = false;
      pendingPairTarget = pairTarget;
      shouldBeConnected = true;
    });
  });
}

function unpairDevice() {
  return enqueueLifecycle("unpair", function () {
    clearReconnectTimer();
    pendingReconnect = false;
    pendingDisconnect = false;
    pendingUnpair = true;
    shouldBeConnected = false;
  });
}

function rebuildCache() {
  readSettings();
  if (!store.get().btid) return Promise.reject(new Error("CORE device is not paired"));
  return runWithTemporaryPower("coretemp.rebuild", function () {
    return enqueueLifecycle("rebuild", function () {
      clearReconnectTimer();
      pendingReconnect = false;
      pendingDisconnect = false;
      pendingRebuildCache = true;
      shouldBeConnected = true;
    });
  });
}

function writeControlPoint(opCode, params, options) {
  if (!controlPointChar || !gatt || !gatt.connected) {
    return Promise.reject(new Error("CORE control point is not connected"));
  }
  return controlpoint.request(opCode, params, options).catch(function (err) {
    if (isBleTransportError(err)) requestTransportReconnect("control_point_transport", err);
    throw err;
  });
}

function getStatus() {
  readSettings();
  return {
    enabled: store.get().enabled === true,
    paired: !!store.get().btid,
    deviceId: store.get().btid,
    deviceName: store.get().btname,
    state: coreState,
    connected: !!(gatt && gatt.connected),
    reconnectScheduled: !!reconnectTimer,
    profileUpgradeScheduled: !!profileUpgradeTimer,
    hasCache: !!(store.get().cache && store.get().cache.characteristics),
    profile: activeProfile,
    customProfileOnly: store.get().customprofileonly === true,
    lastError: lastError,
    activeTask: activeLifecycleTask && activeLifecycleTask.kind,
    desiredConnected: !!shouldBeConnected,
    pendingReconnect: !!pendingReconnect,
    paused: isPaused(),
    pauseOwners: pauseOwners.slice()
  };
}

function pause(owner) {
  if (!owner) owner = "?";
  if (pauseOwners.indexOf(owner) < 0) pauseOwners.push(owner);
  log("CORESensor pause ->", { owner: owner, owners: pauseOwners.slice() });
  clearReconnectTimer();
  clearProfileUpgradeTimer();
  pendingReconnect = false;
  return enqueueLifecycle("pause", function () {
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    pendingReconnect = false;
  });
}

function resume(owner) {
  if (!owner) owner = "?";
  if (pauseOwners.indexOf(owner) >= 0) {
    pauseOwners = pauseOwners.filter(function (activeOwner) {
      return activeOwner !== owner;
    });
  }
  log("CORESensor resume ->", { owner: owner, owners: pauseOwners.slice() });
  if (isPaused()) return Promise.resolve();
  if (!isOn()) {
    pendingReconnect = false;
    clearReconnectTimer();
    clearProfileUpgradeTimer();
    setCoreState(CORE_STATE.IDLE, "resume without power");
    return Promise.resolve();
  }
  return enqueueLifecycle("resume", function () {
    pendingDisconnect = false;
    pendingUnpair = false;
    pendingReconnect = false;
    shouldBeConnected = true;
  });
}

function setPower(isOnValue, app) {
  if (!app) app = "?";
  if (Bangle._PWR === undefined) Bangle._PWR = {};
  if (Bangle._PWR.CORESensor === undefined) Bangle._PWR.CORESensor = [];
  log("setCORESensorPower ->", { on: !!isOnValue, owner: app });
  if (isOnValue && Bangle._PWR.CORESensor.indexOf(app) < 0) Bangle._PWR.CORESensor.push(app);
  if (!isOnValue && Bangle._PWR.CORESensor.indexOf(app) >= 0) {
    Bangle._PWR.CORESensor = Bangle._PWR.CORESensor.filter(function (owner) {
      return owner !== app;
    });
  }
  if (Bangle._PWR.CORESensor.length > 0) {
    // Transient owners borrow power for settings operations. They should not
    // override a pending disconnect/unpair or create background desire alone.
    if (isTransientOwner(app)) return;
    if (!pendingDisconnect && !pendingUnpair) shouldBeConnected = true;
    if (isPaused()) {
      clearReconnectTimer();
      pendingReconnect = false;
      setCoreState(CORE_STATE.IDLE, "paused");
      return;
    }
    enqueueLifecycle("power_on", function () {
      if (!pendingDisconnect && !pendingUnpair) shouldBeConnected = true;
    }).catch(function (e) {
      log("Auto connect failed", e);
    });
  } else {
    shouldBeConnected = false;
    enqueueLifecycle("power_off", function () {
      clearReconnectTimer();
      pendingReconnect = false;
      pendingDisconnect = true;
      shouldBeConnected = false;
    }).catch(function (e) {
      log("CORESensor disconnect error", e);
    });
  }
}

function runWithConnectedSession(owner, fn) {
  return runWithTemporaryPower(owner, function () {
    return connect().then(function () {
      return fn();
    });
  });
}

exports.init = function () {
  if (initialized) return;
  initialized = true;
};

exports.isOn = isOn;
exports.isConnected = isConnected;
exports.connect = connect;
exports.disconnect = disconnect;
exports.pairDevice = pairDevice;
exports.unpairDevice = unpairDevice;
exports.rebuildCache = rebuildCache;
exports.writeControlPoint = writeControlPoint;
exports.getStatus = getStatus;
exports.setPower = setPower;
exports.pause = pause;
exports.resume = resume;
exports.isPaused = isPaused;
exports.runWithConnectedSession = runWithConnectedSession;
exports.onConnected = function (handler) {
  if (typeof handler !== "function") return;
  connectedHandlers.push(handler);
};

exports.shutdown = function () {
  store.flush();
  clearReconnectTimer();
  clearProfileUpgradeTimer();
  shouldBeConnected = false;
  pendingReconnect = false;
  pendingDisconnect = false;
  pendingUnpair = false;
  pendingPairTarget = undefined;
  activePairTarget = undefined;
  pendingRebuildCache = false;
  pauseOwners = [];
  if (gatt || device) {
    setCoreState(CORE_STATE.DISCONNECTING, "kill");
    cleanupGatt("kill");
  }
};
