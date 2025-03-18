exports.enable = () => {
  let settings = Object.assign(
    require('Storage').readJSON("bthrm.default.json", true) || {},
    require('Storage').readJSON("bthrm.json", true) || {}
  );

  let log = function(text, param){
    if (global.showStatusInfo)
      global.showStatusInfo(text);
    if (settings.debuglog){
      let logline = new Date().toISOString() + " - " + text;
      if (param) logline += ": " + JSON.stringify(param);
      print(logline);
    }
  };

  log("Settings: ", settings);

  //this is for compatibility with 0.18 and older
  let oldCache = require('Storage').readJSON("bthrm.cache.json", true);
  if(oldCache){
    settings.cache = oldCache;
    require('Storage').writeJSON("bthrm.json", settings);
    require('Storage').erase("bthrm.cache.json");
  }

  if (settings.enabled && settings.cache){

    log("Start");

    let addNotificationHandler = function(characteristic) {
      log("Setting notification handler"/*supportedCharacteristics[characteristic.uuid].handler*/);
      characteristic.on('characteristicvaluechanged', (ev) => supportedCharacteristics[characteristic.uuid].handler(ev.target.value));
    };


    let characteristicsFromCache = function(device) {
      let service = { device : device }; // fake a BluetoothRemoteGATTService
      log("Read cached characteristics");
      let cache = settings.cache;
      if (!cache.characteristics) return [];
      let restored = [];
      for (let c in cache.characteristics){
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
      "0x2a37": {
        //Heart rate measurement
        active: false,
        handler: function (dv){
          let flags = dv.getUint8(0);

          let bpm = (flags & 1) ? (dv.getUint16(1) / 100 /* ? */ ) : dv.getUint8(1); // 8 or 16 bit
          supportedCharacteristics["0x2a37"].active = bpm > 0;
          log("BTHRM BPM " + supportedCharacteristics["0x2a37"].active);
          switchFallback();
          if (bpmTimeout) clearTimeout(bpmTimeout);
          bpmTimeout = setTimeout(()=>{
            bpmTimeout = undefined;
            supportedCharacteristics["0x2a37"].active = false;
            startFallback();
          }, 3000);

          let sensorContact;

          if (flags & 2){
            sensorContact = !!(flags & 4);
          }

          let idx = 2 + (flags&1);

          let energyExpended;
          if (flags & 8){
            energyExpended = dv.getUint16(idx,1);
            idx += 2;
          }
          let interval;
          if (flags & 16) {
            interval = [];
            let maxIntervalBytes = (dv.byteLength - idx);
            log("Found " + (maxIntervalBytes / 2) + " rr data fields");
            for(let i = 0 ; i < maxIntervalBytes / 2; i++){
              interval[i] = dv.getUint16(idx,1); // in milliseconds
              idx += 2;
            }
          }

          let location;
          if (lastReceivedData && lastReceivedData["0x180d"] && lastReceivedData["0x180d"]["0x2a38"]){
            location = lastReceivedData["0x180d"]["0x2a38"];
          }

          let battery;
          if (lastReceivedData && lastReceivedData["0x180f"] && lastReceivedData["0x180f"]["0x2a19"]){
            battery = lastReceivedData["0x180f"]["0x2a19"];
          }

          if (settings.replace && bpm > 0){
            let repEvent = {
              bpm: bpm,
              confidence: (sensorContact || sensorContact === undefined)? 100 : 0,
              src: "bthrm"
            };

            log("Emitting HRM_R(bt)", repEvent);
            Bangle.emit("HRM_R", repEvent);
          }

          let newEvent = {
            bpm: bpm
          };

          if (location) newEvent.location = location;
          if (interval) newEvent.rr = interval;
          if (energyExpended) newEvent.energy = energyExpended;
          if (battery) newEvent.battery = battery;
          if (sensorContact) newEvent.contact = sensorContact;

          log("Emitting BTHRM", newEvent);
          Bangle.emit("BTHRM", newEvent);
        }
      },
      "0x2a38": {
        //Body sensor location
        handler: function(dv){
          if (!lastReceivedData["0x180d"]) lastReceivedData["0x180d"] = {};
          log("Got location", dv);
          lastReceivedData["0x180d"]["0x2a38"] = parseInt(dv.buffer, 10);
        }
      },
      "0x2a19": {
        //Battery
        handler: function (dv){
          if (!lastReceivedData["0x180f"]) lastReceivedData["0x180f"] = {};
          log("Got battery", dv);
          lastReceivedData["0x180f"]["0x2a19"] = dv.getUint8(0);
        }
      }
    };

    let lastReceivedData={
    };

    let bpmTimeout;

    let device;
    let gatt;
    let characteristics = [];
    let blockInit = false;
    let currentRetryTimeout;
    let initialRetryTime = 40;
    let maxRetryTime = 60000;
    let retryTime = initialRetryTime;

    let waitingPromise = function(timeout) {
      return new Promise(function(resolve){
        log("Start waiting for " + timeout);
        setTimeout(()=>{
          log("Done waiting for " + timeout);
          resolve();
        }, timeout);
      });
    };

    if (settings.enabled){
      Bangle.isBTHRMActive = function (){
        return supportedCharacteristics["0x2a37"].active;
      };

      Bangle.isBTHRMOn = function(){
        return (Bangle._PWR && Bangle._PWR.BTHRM && Bangle._PWR.BTHRM.length > 0);
      };

      Bangle.isBTHRMConnected = function(){
        return gatt && gatt.connected;
      };
    }

    if (settings.replace){
      Bangle.origIsHRMOn = Bangle.isHRMOn;

      Bangle.isHRMOn = function() {
        if (settings.enabled && !settings.replace){
            return Bangle.origIsHRMOn();
        } else if (settings.enabled && settings.replace){
            return Bangle.isBTHRMOn();
        }
        return Bangle.origIsHRMOn() || Bangle.isBTHRMOn();
      };
    }

    let clearRetryTimeout = function(resetTime) {
      if (currentRetryTimeout){
        log("Clearing timeout " + currentRetryTimeout);
        clearTimeout(currentRetryTimeout);
        currentRetryTimeout = undefined;
      }
      if (resetTime) {
        log("Resetting retry time");
        retryTime = initialRetryTime;
      }
    };

    let retry = function() {
      log("Retry");

      if (!currentRetryTimeout && !powerdownRequested){

        let clampedTime = retryTime < 100 ? 100 : retryTime;

        log("Set timeout for retry as " + clampedTime);
        clearRetryTimeout();
        currentRetryTimeout = setTimeout(() => {
          log("Retrying");
          currentRetryTimeout = undefined;
          initBt();
        }, clampedTime);

        retryTime = Math.pow(clampedTime, 1.1);
        if (retryTime > maxRetryTime){
          retryTime = maxRetryTime;
        }
      } else {
        log("Already in retry...");
      }
    };

    let initialDisconnects = true;
    let buzzing = false;
    let onDisconnect = function(reason) {
      log("Disconnect: " + reason);
      log("GATT", gatt);
      log("Characteristics", characteristics);

      let retryTimeResetNeeded = true;
      retryTimeResetNeeded &= reason != "Connection Timeout";
      retryTimeResetNeeded &= reason != "No device found matching filters";
      clearRetryTimeout(retryTimeResetNeeded);
      supportedCharacteristics["0x2a37"].active = false;
      if (!powerdownRequested) startFallback();
      blockInit = false;
      if (settings.warnDisconnect && !buzzing && !initialDisconnects){
        buzzing = true;
        Bangle.buzz(500,0.3).then(()=>waitingPromise(4500)).then(()=>{buzzing = false;});
      }
      if (Bangle.isBTHRMOn()){
        retry();
      }
    };

    let createCharacteristicPromise = function(newCharacteristic) {
      log("Create characteristic promise", newCharacteristic);
      let result = Promise.resolve();
      // For values that can be read, go ahead and read them, even if we might be notified in the future
      // Allows for getting initial state of infrequently updating characteristics, like battery
      if (newCharacteristic.readValue){
        result = result.then(()=>{
          log("Reading data", newCharacteristic);
          return newCharacteristic.readValue().then((data)=>{
            if (supportedCharacteristics[newCharacteristic.uuid] && supportedCharacteristics[newCharacteristic.uuid].handler) {
              supportedCharacteristics[newCharacteristic.uuid].handler(data);
            }
          });
        });
      }
      if (newCharacteristic.properties.notify){
        result = result.then(()=>{
          log("Starting notifications", newCharacteristic);
          let startPromise = newCharacteristic.startNotifications().then(()=>log("Notifications started", newCharacteristic));

          if (settings.gracePeriodNotification){
            log("Add " + settings.gracePeriodNotification + "ms grace period after starting notifications");
            startPromise = startPromise.then(()=>{
              log("Wait after connect");
              return waitingPromise(settings.gracePeriodNotification);
            });
          }
          return startPromise;
        });
      }
      return result.then(()=>log("Handled characteristic", newCharacteristic));
    };

    let attachCharacteristicPromise = function(promise, characteristic) {
      return promise.then(()=>{
        log("Handling characteristic:", characteristic);
        return createCharacteristicPromise(characteristic);
      });
    };

    let initBt = function () {
      log("initBt with blockInit: " + blockInit);
      if (blockInit && !powerdownRequested){
        retry();
        return;
      }

      blockInit = true;

      let promise;
      let filters;

      if (!device){
        if (settings.btid){
          log("Configured device id", settings.btid);
          filters = [{ id: settings.btid }];
        } else {
          return;
        }
        log("Requesting device with filters", filters);
        try {
          promise = NRF.requestDevice({ filters: filters, active: settings.active });
        } catch (e){
          log("Error during initial request:", e);
          onDisconnect(e);
          return;
        }

        if (settings.gracePeriodRequest){
          log("Add " + settings.gracePeriodRequest + "ms grace period after request");
          promise = promise.then((d)=>{
            log("Wait after request");
            return waitingPromise(settings.gracePeriodRequest).then(()=>Promise.resolve(d));
          });
        }

        promise = promise.then((d)=>{
          log("Got device", d);
          d.on('gattserverdisconnected', onDisconnect);
          device = d;
        });
      } else {
        promise = Promise.resolve();
        log("Reuse device", device);
      }

      promise = promise.then(()=>{
        gatt = device.gatt;
        return Promise.resolve(gatt);
      });

      promise = promise.then((gatt)=>{
        if (!gatt.connected){
          log("Connecting...");
          let connectPromise = gatt.connect().then(function() {
            log("Connected.");
          });
          if (settings.gracePeriodConnect){
            log("Add " + settings.gracePeriodConnect + "ms grace period after connecting");
            connectPromise = connectPromise.then(()=>{
              log("Wait after connect");
              return waitingPromise(settings.gracePeriodConnect);
            });
          }
          return connectPromise;
        } else {
          return Promise.resolve();
        }
      });

      promise = promise.then(()=>{
        if (!characteristics || characteristics.length == 0){
          characteristics = characteristicsFromCache(device);
        }
        let characteristicsPromise = Promise.resolve();
        for (let characteristic of characteristics){
          characteristicsPromise = attachCharacteristicPromise(characteristicsPromise, characteristic, true);
        }

        return characteristicsPromise;
      });

      return promise.then(()=>{
        log("Connection established, waiting for notifications");
        initialDisconnects = false;
        clearRetryTimeout(true);
      }).catch((e) => {
        characteristics = [];
        log("Error:", e);
        onDisconnect(e);
      });
    };

    let powerdownRequested = false;

    Bangle.setBTHRMPower = function(isOn, app) {
      // Do app power handling
      if (!app) app="?";
      if (Bangle._PWR===undefined) Bangle._PWR={};
      if (Bangle._PWR.BTHRM===undefined) Bangle._PWR.BTHRM=[];
      if (isOn && !Bangle._PWR.BTHRM.includes(app)) Bangle._PWR.BTHRM.push(app);
      if (!isOn && Bangle._PWR.BTHRM.includes(app)) Bangle._PWR.BTHRM = Bangle._PWR.BTHRM.filter(a=>a!==app);
      isOn = Bangle._PWR.BTHRM.length;
      // so now we know if we're really on
      if (isOn) {
        initialDisconnects = true;
        powerdownRequested = false;
        switchFallback();
        if (!Bangle.isBTHRMConnected()) initBt();
      } else { // not on
        log("Power off for " + app);
        powerdownRequested = true;
        clearRetryTimeout(true);
        stopFallback();
        if (gatt) {
          if (gatt.connected){
            log("Disconnect with gatt", gatt);
            try{
              gatt.disconnect().then(()=>{
                log("Successful disconnect");
              }).catch((e)=>{
                log("Error during disconnect promise", e);
              });
            } catch (e){
              log("Error during disconnect attempt", e);
            }
          }
        }
      }
    };

    if (settings.replace){
      // register a listener for original HRM events and emit as HRM_int
      Bangle.on("HRM", (o) => {
        let e = Object.assign({},o);
        log("Emitting HRM_int", e);
        Bangle.emit("HRM_int", e);
        if (fallbackActive){
          // if fallback to internal HRM is active, emit as HRM_R to which everyone listens
          o.src = "int";
          log("Emitting HRM_R(int)", o);
          Bangle.emit("HRM_R", o);
        }
      });

      // force all apps wanting to listen to HRM to actually get events for HRM_R
      Bangle.on = ( o => (name, cb) => {
        o = o.bind(Bangle);
        if (name == "HRM") o("HRM_R", cb);
        else o(name, cb);
      })(Bangle.on);

      Bangle.removeListener = ( o => (name, cb) => {
        o = o.bind(Bangle);
        if (name == "HRM") o("HRM_R", cb);
        else o(name, cb);
      })(Bangle.removeListener);
    } else {
      Bangle.on("HRM", (o)=>{
        o.src = "int";
        let e = Object.assign({},o);
        log("Emitting HRM_int", e);
        Bangle.emit("HRM_int", e);
      });
    }

    Bangle.origSetHRMPower = Bangle.setHRMPower;

    if (settings.startWithHrm){
      Bangle.setHRMPower = function(isOn, app) {
        log("setHRMPower for " + app + ": " + (isOn?"on":"off"));
        if (settings.enabled){
          Bangle.setBTHRMPower(isOn, app);
          if (Bangle._PWR && Bangle._PWR.HRM && Object.keys(Bangle._PWR.HRM).length == 0) {
            Bangle._PWR.BTHRM = [];
            Bangle.setBTHRMPower(0);
            if (!isOn) stopFallback();
          }
          return Bangle.isBTHRMOn() || Bangle.isHRMOn();
        }
        if ((settings.enabled && !settings.replace) || !settings.enabled){
          return Bangle.origSetHRMPower(isOn, app);
        }
      };
    }

    let fallbackActive = false;
    let inSwitch = false;

    let stopFallback = function(){
      if (fallbackActive){
        Bangle.origSetHRMPower(0, "bthrm_fallback");
        fallbackActive = false;
        log("Fallback to HRM disabled");
      }
    };

    let startFallback = function(){
      if (!fallbackActive && settings.allowFallback) {
        fallbackActive = true;
        Bangle.origSetHRMPower(1, "bthrm_fallback");
        log("Fallback to HRM enabled");
      }
    };

    let switchFallback = function() {
      log("Check falling back to HRM");
      if (!inSwitch){
        inSwitch = true;
        if (Bangle.isBTHRMActive()){
          stopFallback();
        } else {
          startFallback();
        }
      }
      inSwitch = false;
    };

    if (settings.replace){
      log("Replace HRM event");
      if (Bangle._PWR && Bangle._PWR.HRM){
        for (let i = 0; i < Bangle._PWR.HRM.length; i++){
          let app = Bangle._PWR.HRM[i];
          log("Moving app " + app);
          Bangle.origSetHRMPower(0, app);
          Bangle.setBTHRMPower(1, app);
          if (Bangle._PWR.HRM===undefined) break;
        }
      }
    }

    E.on("kill", ()=>{
      if (gatt && gatt.connected){
        log("Got killed, trying to disconnect");
        try {
          gatt.disconnect().then(()=>log("Disconnected on kill")).catch((e)=>log("Error during disconnnect promise on kill", e));
        } catch (e) {
          log("Error during disconnnect on kill", e)
        }
      }
    });
  }
};
