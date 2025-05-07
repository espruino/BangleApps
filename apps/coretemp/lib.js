exports.enable = () => {
  var settings = require("Storage").readJSON("coretemp.json", 1) || {};
  let log = function () { };//print
  Bangle.enableCORESensorLog = function () {
    log = function (text, param) {
      let logline = new Date().toISOString() + " - " + text;
      if (param) logline += ": " + JSON.stringify(param);
      print(logline);
    };
  };
  let gatt;
  let device;
  let characteristics;
  let blockInit = false;
  let waitingPromise = function (timeout) {
    return new Promise(function (resolve) {
      log("Start waiting for " + timeout);
      setTimeout(() => {
        log("Done waiting for " + timeout);
        resolve();
      }, timeout);
    });
  };

  if (settings.enabled && settings.cache) {
    let addNotificationHandler = function (characteristic) {
      log("Setting notification handler"/*supportedCharacteristics[characteristic.uuid].handler*/);
      characteristic.on('characteristicvaluechanged', (ev) => supportedCharacteristics[characteristic.uuid].handler(ev.target.value));
    };
    let characteristicsFromCache = function (device) {
      let service = { device: device }; // fake a BluetoothRemoteGATTService
      log("Read cached characteristics");
      let cache = settings.cache;
      if (!cache.characteristics) return [];
      let restored = [];
      for (let c in cache.characteristics) {
        let cached = cache.characteristics[c];
        let r = new BluetoothRemoteGATTCharacteristic();
        log("Restoring characteristic ", cached);
        r.handle_value = cached.handle;
        r.uuid = cached.uuid;
        r.properties = {};
        r.properties.notify = cached.notify;
        r.properties.read = cached.read;
        r.service = service;
        addNotificationHandler(r);
        log("Restored characteristic: ", r);
        restored.push(r);
      }
      return restored;
    };
    let supportedCharacteristics = {
      "00002101-5b1e-4347-b07c-97b514dae121": {
        handler: function (dv) {
          log(dv);
          let index = 0;
          let flags = dv.getUint8(index++);
          let coreTemp = dv.getInt16(index, true) / 100.0;
          index += 2;
          let skinTemp = dv.getInt16(index, true) / 100.0;
          index += 2;
          let coreReserved = dv.getInt16(index, true); //caleraGT only with firmware decryption provided by Greenteg
          index += 2;
          let qualityAndState = dv.getUint8(index++);
          let heartRate = dv.getUint8(index++);
          let heatStrainIndex = dv.getUint8(index) / 10.0;
          let dataQuality = qualityAndState & 0x07;
          let hrState = (qualityAndState >> 4) & 0x03;
          let data = {
            core: coreTemp,
            skin: skinTemp,
            unit: (flags & 0b00001000) ? "F" : "C",
            hr: heartRate,
            heatflux: coreReserved,
            hsi: heatStrainIndex,
            battery: 0,
            dataQuality: dataQuality,
            hrState: hrState
          };
          if (lastReceivedData.hasOwnProperty("0x180f")) {
            data.battery = lastReceivedData["0x180f"]["0x2a19"];
          }
          log("data", data);
          Bangle.emit("CORESensor", data);
        }
      },
      "00002102-5b1e-4347-b07c-97b514dae121": {
        handler: function (dv) {
          log(dv);//just log the response, handle write and responses in another Promise Function (Bangle.CORESensorSendOpCode)
        }
      },
      "0x2a19": {
        //Battery
        handler: function (dv) {
          if (!lastReceivedData["0x180f"]) lastReceivedData["0x180f"] = {};
          log("Got battery", dv);
          lastReceivedData["0x180f"]["0x2a19"] = dv.getUint8(0);
        }
      }
    };
    let lastReceivedData = {
    };

    Bangle.isCORESensorOn = function () {
      return (Bangle._PWR && Bangle._PWR.CORESensor && Bangle._PWR.CORESensor.length > 0);
    };

    Bangle.isCORESensorConnected = function () {
      return gatt && gatt.connected;
    };

    let onDisconnect = function (reason) {
      blockInit = false;
      log("Disconnect: " + reason);
      if (Bangle.isCORESensorOn()) {
        setTimeout(initCORESensor, 5000);
      }
    };
    let createCharacteristicPromise = function (newCharacteristic) {
      log("Create characteristic promise", newCharacteristic);
      let result = Promise.resolve();
      if (newCharacteristic.readValue) {
        result = result.then(() => {
          log("Reading data", newCharacteristic);
          return newCharacteristic.readValue().then((data) => {
            if (supportedCharacteristics[newCharacteristic.uuid] && supportedCharacteristics[newCharacteristic.uuid].handler) {
              supportedCharacteristics[newCharacteristic.uuid].handler(data);
            }
          });
        });
      }
      if (newCharacteristic.properties.notify) {
        result = result.then(() => {
          log("Starting notifications", newCharacteristic);
          let startPromise = newCharacteristic.startNotifications().then(() => log("Notifications started", newCharacteristic));
          startPromise = startPromise.then(() => {
            return waitingPromise(3000);
          });
          return startPromise;
        });
      }
      return result.then(() => log("Handled characteristic", newCharacteristic));
    };

    let attachCharacteristicPromise = function (promise, characteristic) {
      return promise.then(() => {
        log("Handling characteristic:", characteristic);
        return createCharacteristicPromise(characteristic);
      });
    };
    let initCORESensor = function () {
      if (!settings.btname) {
        log("CORESensor not paired, quitting");
        return;
      }
      if (blockInit) {
        log("CORESensor already turned on by another app, quitting");
        return;
      }
      blockInit = true;
      NRF.setScan();
      let promise;
      let filters;

      if (!device) {
        if (settings.btname) {
          log("Configured device name ", settings.btname);
          filters = [{ name: settings.btname }];
        } else {
          return;
        }
        log("Requesting device with filters", filters);
        try {
          promise = NRF.requestDevice({ filters: filters, active: true });
        } catch (e) {
          log("Error during initial request:", e);
          onDisconnect(e);
          return;
        }
        promise = promise.then((d) => {
          log("Wait after request");
          return waitingPromise(2000).then(() => Promise.resolve(d));
        });

        promise = promise.then((d) => {
          log("Got device", d);
          d.on('gattserverdisconnected', onDisconnect);
          device = d;
        });
      } else {
        promise = Promise.resolve();
        log("Reuse device", device);
      }

      promise = promise.then(() => {
        gatt = device.gatt;
        return Promise.resolve(gatt);
      });

      promise = promise.then((gatt) => {
        if (!gatt.connected) {
          log("Connecting...");
          let connectPromise = gatt.connect().then(function () {
            log("Connected.");
          });
          connectPromise = connectPromise.then(() => {
            log("Wait after connect");
            return waitingPromise(2000);
          });
          return connectPromise;
        } else {
          return Promise.resolve();
        }
      });

      promise = promise.then(() => {
        if (!characteristics || characteristics.length == 0) {
          characteristics = characteristicsFromCache(device);
        }
        let characteristicsPromise = Promise.resolve();
        for (let characteristic of characteristics) {
          characteristicsPromise = attachCharacteristicPromise(characteristicsPromise, characteristic, true);
        }

        return characteristicsPromise;
      });

      return promise.then(() => {
        log("Connection established, waiting for notifications");
      }).catch((e) => {
        characteristics = [];
        log("Error:", e);
        onDisconnect(e);
      });
    };
    Bangle.setCORESensorPower = function (isOn, app) {
      // Do app power handling
      if (!app) app = "?";
      log("setCORESensorPower ->", isOn, app);
      if (Bangle._PWR === undefined) Bangle._PWR = {};
      if (Bangle._PWR.CORESensor === undefined) Bangle._PWR.CORESensor = [];
      if (isOn && !Bangle._PWR.CORESensor.includes(app)) Bangle._PWR.CORESensor.push(app);
      if (!isOn && Bangle._PWR.CORESensor.includes(app)) Bangle._PWR.CORESensor = Bangle._PWR.CORESensor.filter(a => a != app);
      isOn = Bangle._PWR.CORESensor.length;
      // so now we know if we're really on
      if (isOn) {
        log("setCORESensorPower on" + app);
        if (!Bangle.isCORESensorConnected()) initCORESensor();
      } else { // being turned off! 
        log("setCORESensorPower turning off ", app);
        if (gatt) {
          if (gatt.connected) {
            log("CORESensor: Disconnect with gatt", gatt);
            try {
              gatt.disconnect().then(() => {
                log("CORESensor: Successful disconnect");
              }).catch((e) => {
                log("CORESensor: Error during disconnect promise", e);
              });
            } catch (e) {
              log("CORESensor: Error during disconnect attempt", e);
            }
          }
        }
      }
    };

    // disconnect when swapping apps
    E.on("kill", function () {
      if (gatt) {
        log("CORESensor connected - disconnecting");
        try { gatt.disconnect(); } catch (e) {
          log("CORESensor disconnect error", e);
        }
        gatt = undefined;
      }
    });
  }
};