const dataview = require("./dataview");

function createCharacteristic(uuid, properties) {
  const handlers = {};
  const writes = [];
  return {
    uuid,
    properties: properties || {},
    writes,
    handlers,
    on(name, handler) {
      (handlers[name] || (handlers[name] = [])).push(handler);
    },
    removeListener(name, handler) {
      handlers[name] = (handlers[name] || []).filter(item => item !== handler);
    },
    startNotifications() {
      this.notificationsStarted = true;
      return Promise.resolve();
    },
    readValue() {
      return Promise.resolve(dataview.fromBytes([90]));
    },
    writeValue(value) {
      writes.push(Array.prototype.slice.call(value));
      return Promise.resolve();
    },
    emitValue(bytes) {
      (handlers.characteristicvaluechanged || []).slice().forEach(handler => handler({
        target: {
          value: dataview.fromBytes(bytes)
        }
      }));
    }
  };
}

exports.createCharacteristic = createCharacteristic;

exports.create = function createFakeBLE(protocol, options) {
  options = options || {};
  const disconnectHandlers = [];
  const getPrimaryServiceCalls = [];
  const coreServiceUuid = options.uppercaseUuids ? protocol.CORE_SERVICE_UUID.toUpperCase() : protocol.CORE_SERVICE_UUID;
  const tempUuid = options.uppercaseUuids ? protocol.CORE_TEMP_UUID.toUpperCase() : protocol.CORE_TEMP_UUID;
  const controlPointUuid = options.uppercaseUuids ? protocol.CORE_CONTROL_POINT_UUID.toUpperCase() : protocol.CORE_CONTROL_POINT_UUID;
  const tempChar = createCharacteristic(tempUuid, { notify: true });
  const controlPointChar = createCharacteristic(controlPointUuid, {
    indicate: true,
    write: true
  });
  const batteryChar = createCharacteristic("0x2a19", { read: true });
  const healthThermometerChar = createCharacteristic("00002a1c-0000-1000-8000-00805f9b34fb", {
    indicate: true
  });
  const coreCharacteristics = options.includeCoreCharacteristics === false ?
    [] :
    (options.includeControlPoint === false ? [tempChar] : [tempChar, controlPointChar]);
  const services = options.healthThermometerOnly ? [{
    uuid: "00001809-0000-1000-8000-00805f9b34fb",
    getCharacteristics() {
      return Promise.resolve([healthThermometerChar]);
    }
  }] : options.includeHealthThermometer ? [{
    uuid: "00001809-0000-1000-8000-00805f9b34fb",
    getCharacteristics() {
      return Promise.resolve([healthThermometerChar]);
    }
  }, {
    uuid: coreServiceUuid,
    getCharacteristics() {
      return Promise.resolve(coreCharacteristics);
    }
  }] : [{
    uuid: coreServiceUuid,
    getCharacteristics() {
      return Promise.resolve(coreCharacteristics);
    }
  }];
  if (options.includeBattery !== false) services.push({
    uuid: protocol.BATTERY_SERVICE_UUID,
    getCharacteristics() {
      return Promise.resolve([batteryChar]);
    }
  });
  const gatt = {
    connected: false,
    bondCalls: 0,
    connect() {
      this.connected = true;
      return Promise.resolve();
    },
    disconnect() {
      this.connected = false;
    },
    getSecurityStatus() {
      return {
        connected: this.connected,
        encrypted: !!options.encrypted,
        bonded: !!options.bonded
      };
    },
    startBonding() {
      this.bondCalls++;
      if (options.bondReject) return Promise.reject(options.bondReject);
      options.bonded = true;
      return Promise.resolve();
    },
    getPrimaryServices() {
      return Promise.resolve(services);
    },
    getPrimaryService(uuid) {
      getPrimaryServiceCalls.push(uuid);
      const normalize = value => value.toLowerCase().replace(/^0000([0-9a-f]{4})-0000-1000-8000-00805f9b34fb$/, "0x$1");
      return Promise.resolve(services.find(service => normalize(service.uuid) === normalize(uuid)));
    }
  };
  const device = {
    id: "core-1",
    name: "CORE",
    gatt,
    on(name, handler) {
      if (name === "gattserverdisconnected") disconnectHandlers.push(handler);
    },
    removeListener(name, handler) {
      if (name === "gattserverdisconnected") {
        const index = disconnectHandlers.indexOf(handler);
        if (index >= 0) disconnectHandlers.splice(index, 1);
      }
    },
    emitDisconnect(reason) {
      gatt.connected = false;
      disconnectHandlers.slice().forEach(handler => handler(reason));
    }
  };
  const NRF = {
    requests: [],
    setScan() {},
    requestDevice(options) {
      this.requests.push(options);
      return Promise.resolve(device);
    }
  };

  return {
    NRF,
    device,
    gatt,
    getPrimaryServiceCalls,
    disconnectHandlers,
    batteryChar,
    tempChar,
    controlPointChar,
    healthThermometerChar
  };
};
