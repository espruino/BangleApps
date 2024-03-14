exports.enable = () => {
  var settings = Object.assign(
    require('Storage').readJSON("bthrm.default.json", true) || {},
    require('Storage').readJSON("bthrm.json", true) || {}
  );

  var log = function(text, param){
    if (global.showStatusInfo)
      global.showStatusInfo(text);
    if (settings.debuglog){
      var logline = new Date().toISOString() + " - " + text;
      if (param) logline += ": " + JSON.stringify(param);
      print(logline);
    }
  };

  log("Settings: ", settings);

  if (settings.enabled){

    var clearCache = function() {
      return require('Storage').erase("bthrm.cache.json");
    };

    var getCache = function() {
      var cache = require('Storage').readJSON("bthrm.cache.json", true) || {};
      if (settings.btid && settings.btid === cache.id) return cache;
      clearCache();
      return {};
    };

    var addNotificationHandler = function(characteristic) {
      log("Setting notification handler"/*supportedCharacteristics[characteristic.uuid].handler*/);
      characteristic.on('characteristicvaluechanged', (ev) => supportedCharacteristics[characteristic.uuid].handler(ev.target.value));
    };

    var writeCache = function(cache) {
      var oldCache = getCache();
      if (oldCache !== cache) {
        log("Writing cache");
        require('Storage').writeJSON("bthrm.cache.json", cache);
      } else {
        log("No changes, don't write cache");
      }
    };

    var characteristicsToCache = function(characteristics) {
      log("Cache characteristics");
      var cache = getCache();
      if (!cache.characteristics) cache.characteristics = {};
      for (var c of characteristics){
        //"handle_value":16,"handle_decl":15
        log("Saving handle " + c.handle_value + " for characteristic: ", c);
        cache.characteristics[c.uuid] = {
          "handle": c.handle_value,
          "uuid": c.uuid,
          "notify": c.properties.notify,
          "read": c.properties.read
        };
      }
      writeCache(cache);
    };

    var characteristicsFromCache = function(device) {
      var service = { device : device }; // fake a BluetoothRemoteGATTService
      log("Read cached characteristics");
      var cache = getCache();
      if (!cache.characteristics) return [];
      var restored = [];
      for (var c in cache.characteristics){
        var cached = cache.characteristics[c];
        var r = new BluetoothRemoteGATTCharacteristic();
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

    log("Start");

    var lastReceivedData={
    };

    var supportedServices = [
      "0x180d", // Heart Rate
      "0x180f", // Battery
    ];

    var bpmTimeout;

    var supportedCharacteristics = {
      "0x2a37": {
        //Heart rate measurement
        active: false,
        handler: function (dv){
          var flags = dv.getUint8(0);

          var bpm = (flags & 1) ? (dv.getUint16(1) / 100 /* ? */ ) : dv.getUint8(1); // 8 or 16 bit
          supportedCharacteristics["0x2a37"].active = bpm > 0;
          log("BTHRM BPM " + supportedCharacteristics["0x2a37"].active);
          switchFallback();
          if (bpmTimeout) clearTimeout(bpmTimeout);
          bpmTimeout = setTimeout(()=>{
            bpmTimeout = undefined;
            supportedCharacteristics["0x2a37"].active = false;
            startFallback();
          }, 3000);

          var sensorContact;

          if (flags & 2){
            sensorContact = !!(flags & 4);
          }

          var idx = 2 + (flags&1);

          var energyExpended;
          if (flags & 8){
            energyExpended = dv.getUint16(idx,1);
            idx += 2;
          }
          var interval;
          if (flags & 16) {
            interval = [];
            var maxIntervalBytes = (dv.byteLength - idx);
            log("Found " + (maxIntervalBytes / 2) + " rr data fields");
            for(var i = 0 ; i < maxIntervalBytes / 2; i++){
              interval[i] = dv.getUint16(idx,1); // in milliseconds
              idx += 2;
            }
          }

          var location;
          if (lastReceivedData && lastReceivedData["0x180d"] && lastReceivedData["0x180d"]["0x2a38"]){
            location = lastReceivedData["0x180d"]["0x2a38"];
          }

          var battery;
          if (lastReceivedData && lastReceivedData["0x180f"] && lastReceivedData["0x180f"]["0x2a19"]){
            battery = lastReceivedData["0x180f"]["0x2a19"];
          }

          if (settings.replace && bpm > 0){
            var repEvent = {
              bpm: bpm,
              confidence: (sensorContact || sensorContact === undefined)? 100 : 0,
              src: "bthrm"
            };

            log("Emitting HRM_R(bt)", repEvent);
            Bangle.emit("HRM_R", repEvent);
          }

          var newEvent = {
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
          lastReceivedData["0x180d"]["0x2a38"] = parseInt(dv.buffer, 10);
        }
      },
      "0x2a19": {
        //Battery
        handler: function (dv){
          if (!lastReceivedData["0x180f"]) lastReceivedData["0x180f"] = {};
          lastReceivedData["0x180f"]["0x2a19"] = dv.getUint8(0);
        }
      }
    };

    var device;
    var gatt;
    var characteristics = [];
    var blockInit = false;
    var currentRetryTimeout;
    var initialRetryTime = 40;
    var maxRetryTime = 60000;
    var retryTime = initialRetryTime;

    var connectSettings = {
      minInterval: 7.5,
      maxInterval: 1500
    };

    var waitingPromise = function(timeout) {
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

    var clearRetryTimeout = function(resetTime) {
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

    var retry = function() {
      log("Retry");

      if (!currentRetryTimeout && !powerdownRequested){

        var clampedTime = retryTime < 100 ? 100 : retryTime;

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

    var buzzing = false;
    var onDisconnect = function(reason) {
      log("Disconnect: " + reason);
      log("GATT", gatt);
      log("Characteristics", characteristics);

      var retryTimeResetNeeded = true;
      retryTimeResetNeeded &= reason != "Connection Timeout";
      retryTimeResetNeeded &= reason != "No device found matching filters";
      clearRetryTimeout(retryTimeResetNeeded);
      supportedCharacteristics["0x2a37"].active = false;
      if (!powerdownRequested) startFallback();
      blockInit = false;
      if (settings.warnDisconnect && !buzzing){
        buzzing = true;
        Bangle.buzz(500,0.3).then(()=>waitingPromise(4500)).then(()=>{buzzing = false;});
      }
      if (Bangle.isBTHRMOn()){
        retry();
      }
    };

    var createCharacteristicPromise = function(newCharacteristic) {
      log("Create characteristic promise", newCharacteristic);
      var result = Promise.resolve();
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
          var startPromise = newCharacteristic.startNotifications().then(()=>log("Notifications started", newCharacteristic));
          
          log("Add " + settings.gracePeriodNotification + "ms grace period after starting notifications");
          startPromise = startPromise.then(()=>{
            log("Wait after connect");
            return waitingPromise(settings.gracePeriodNotification);
          });
          
          return startPromise;
        });
      }
      return result.then(()=>log("Handled characteristic", newCharacteristic));
    };

    var attachCharacteristicPromise = function(promise, characteristic) {
      return promise.then(()=>{
        log("Handling characteristic:", characteristic);
        return createCharacteristicPromise(characteristic);
      });
    };

    var createCharacteristicsPromise = function(newCharacteristics) {
      log("Create characteristics promis ", newCharacteristics);
      var result = Promise.resolve();
      for (var c of newCharacteristics){
        if (!supportedCharacteristics[c.uuid]) continue;
        log("Supporting characteristic", c);
        characteristics.push(c);
        if (c.properties.notify){
          addNotificationHandler(c);
        }

        result = attachCharacteristicPromise(result, c);
      }
      return result.then(()=>log("Handled characteristics"));
    };

    var createServicePromise = function(service) {
      log("Create service promise", service);
      var result = Promise.resolve();
      result = result.then(()=>{
        log("Handling service" + service.uuid);
        return service.getCharacteristics().then((c)=>createCharacteristicsPromise(c));
      });
      return result.then(()=>log("Handled service" + service.uuid));
    };

    var attachServicePromise = function(promise, service) {
      return promise.then(()=>createServicePromise(service));
    };

    var initBt = function () {
      log("initBt with blockInit: " + blockInit);
      if (blockInit && !powerdownRequested){
        retry();
        return;
      }

      blockInit = true;

      var promise;
      var filters;

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
        }

        promise = promise.then((d)=>{
          log("Got device", d);
          d.on('gattserverdisconnected', onDisconnect);
          device = d;
        });

        promise = promise.then(()=>{
          log("Wait after request");
          return waitingPromise(settings.gracePeriodRequest);
        });
      } else {
        promise = Promise.resolve();
        log("Reuse device", device);
      }

      promise = promise.then(()=>{
        if (gatt){
          log("Reuse GATT", gatt);
        } else {
          log("GATT is new", gatt);
          characteristics = [];
          var cachedId = getCache().id;
          if (device.id !== cachedId){
            log("Device ID changed from " + cachedId + " to " + device.id + ", clearing cache");
            clearCache();
          }
          var newCache = getCache();
          newCache.id = device.id;
          writeCache(newCache);
          gatt = device.gatt;
        }

        return Promise.resolve(gatt);
      });

      promise = promise.then((gatt)=>{
        if (!gatt.connected){
          log("Connecting...");
          var connectPromise = gatt.connect(connectSettings).then(function() {
            log("Connected.");
          });
          log("Add " + settings.gracePeriodConnect + "ms grace period after connecting");
          connectPromise = connectPromise.then(()=>{
            log("Wait after connect");
            return waitingPromise(settings.gracePeriodConnect);
          });
          return connectPromise;
        } else {
          return Promise.resolve();
        }
      });
      
      if (settings.bonding){
        promise = promise.then(() => {
          log(JSON.stringify(gatt.getSecurityStatus()));
          if (gatt.getSecurityStatus()['bonded']) {
            log("Already bonded");
            return Promise.resolve();
          } else {
            log("Start bonding");
            return gatt.startBonding()
              .then(() => log("Security status" + gatt.getSecurityStatus()));
          }
        });
      }

      promise = promise.then(()=>{
        if (!characteristics || characteristics.length === 0){
          characteristics = characteristicsFromCache(device);
        }
      });

      promise = promise.then(()=>{
        var characteristicsPromise = Promise.resolve();
        if (characteristics.length === 0){
          characteristicsPromise = characteristicsPromise.then(()=>{
            log("Getting services");
            return gatt.getPrimaryServices();
          });

          characteristicsPromise = characteristicsPromise.then((services)=>{
            log("Got services", services);
            var result = Promise.resolve();
            for (var service of services){
              if (!(supportedServices.includes(service.uuid))) continue;
              log("Supporting service", service.uuid);
              result = attachServicePromise(result, service);
            }
            log("Add " + settings.gracePeriodService + "ms grace period after services");
            result = result.then(()=>{
              log("Wait after services");
              return waitingPromise(settings.gracePeriodService);
            });
            return result;
          });
        } else {
          for (var characteristic of characteristics){
            characteristicsPromise = attachCharacteristicPromise(characteristicsPromise, characteristic, true);
          }
        }

        return characteristicsPromise;
      });

      return promise.then(()=>{
        log("Connection established, waiting for notifications");
        characteristicsToCache(characteristics);
        clearRetryTimeout(true);
      }).catch((e) => {
        characteristics = [];
        log("Error:", e);
        onDisconnect(e);
      });
    };

    var powerdownRequested = false;

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
        }
        if ((settings.enabled && !settings.replace) || !settings.enabled){
          Bangle.origSetHRMPower(isOn, app);
        }
      };
    }

    var fallbackActive = false;
    var inSwitch = false;

    var stopFallback = function(){
      if (fallbackActive){
        Bangle.origSetHRMPower(0, "bthrm_fallback");
        fallbackActive = false;
        log("Fallback to HRM disabled");
      }
    };

    var startFallback = function(){
      if (!fallbackActive && settings.allowFallback) {
        fallbackActive = true;
        Bangle.origSetHRMPower(1, "bthrm_fallback");
        log("Fallback to HRM enabled");
      }
    };

    var switchFallback = function() {
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
        for (var i = 0; i < Bangle._PWR.HRM.length; i++){
          var app = Bangle._PWR.HRM[i];
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
