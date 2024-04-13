(function(back) {
  function writeSettings(key, value) {
    let s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = Object.assign(
      require('Storage').readJSON("bthrm.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {}
    );
  }

  let FILE="bthrm.json";
  let settings;
  readSettings();

  let log = ()=>{};
  if (settings.debuglog)
    log = print;

  function applyCustomSettings(){
    writeSettings("enabled",true);
    writeSettings("replace",settings.custom_replace);
    writeSettings("startWithHrm",settings.custom_startWithHrm);
    writeSettings("allowFallback",settings.custom_allowFallback);
    writeSettings("fallbackTimeout",settings.custom_fallbackTimeout);
  }

  function buildMainMenu(){
    let mainmenu = {
      '': { 'title': 'Bluetooth HRM' },
      '< Back': back,
      'Mode': {
        value: 0 | settings.mode,
        min: 0,
        max: 3,
        format: v => ["Off", "Default", "Both", "Custom"][v],
        onchange: v => {
          settings.mode = v;
          switch (v){
            case 0:
              writeSettings("enabled",false);
              break;
            case 1:
              writeSettings("enabled",true);
              writeSettings("replace",true);
              writeSettings("startWithHrm",true);
              writeSettings("allowFallback",true);
              writeSettings("fallbackTimeout",10);
              break;
            case 2:
              writeSettings("enabled",true);
              writeSettings("replace",false);
              writeSettings("startWithHrm",false);
              writeSettings("allowFallback",false);
              break;
            case 3:
              applyCustomSettings();
              break;
          }
          writeSettings("mode",v);
        }
      }
    };

    if (settings.btname || settings.btid){
      let name = "Clear " + (settings.btname || settings.btid);
      mainmenu[name] = function() {
      E.showPrompt("Clear current device?").then((r)=>{
          if (r) {
            writeSettings("btname",undefined);
            writeSettings("btid",undefined);
            writeSettings("cache", undefined);
          }
          E.showMenu(buildMainMenu());
        });
      };
    }

    mainmenu["BLE Scan"] = ()=> createMenuFromScan();
    mainmenu["Custom Mode"] = function() { E.showMenu(submenu_custom); };
    mainmenu.Debug = function() { E.showMenu(submenu_debug); };
    return mainmenu;
  }

  let submenu_debug = {
    '' : { title: "Debug"},
    '< Back': function() { E.showMenu(buildMainMenu()); },
    'Alert on disconnect': {
      value: !!settings.warnDisconnect,
      onchange: v => {
        writeSettings("warnDisconnect",v);
      }
    },
    'Debug log': {
      value: !!settings.debuglog,
      onchange: v => {
        writeSettings("debuglog",v);
      }
    },
    'Use bonding': {
      value: !!settings.bonding,
      onchange: v => {
        writeSettings("bonding",v);
      }
    },
    'Use active scanning': {
      value: !!settings.active,
      onchange: v => {
        writeSettings("active",v);
      }
    },
    'Grace periods': function() { E.showMenu(submenu_grace); }
  };

  let supportedServices = [
    "0x180d", // Heart Rate
    "0x180f", // Battery
  ];

  let supportedCharacteristics = [
    "0x2a37", // Heart Rate
    "0x2a38", // Body sensor location
    "0x2a19", // Battery
  ];

  var characteristicsToCache = function(characteristics) {
    log("Cache characteristics");
    let cache = {};
    if (!cache.characteristics) cache.characteristics = {};
    for (var c of characteristics){
      //"handle_value":16,"handle_decl":15
      log("Saving handle " + c.handle_value + " for characteristic: ", c.uuid);
      cache.characteristics[c.uuid] = {
        "handle": c.handle_value,
        "uuid": c.uuid,
        "notify": c.properties.notify,
        "read": c.properties.read
      };
    }
    writeSettings("cache", cache);
  };

  let createCharacteristicPromise = function(newCharacteristic) {
    log("Create characteristic promise", newCharacteristic.uuid);
    return Promise.resolve().then(()=>log("Handled characteristic", newCharacteristic.uuid));
  };

  let attachCharacteristicPromise = function(promise, characteristic) {
    return promise.then(()=>{
      log("Handling characteristic:", characteristic.uuid);
      return createCharacteristicPromise(characteristic);
    });
  };

  let characteristics;

  let createCharacteristicsPromise = function(newCharacteristics) {
    log("Create characteristics promise ", newCharacteristics.length);
    let result = Promise.resolve();
    for (let c of newCharacteristics){
      if (!supportedCharacteristics.includes(c.uuid)) continue;
      log("Supporting characteristic", c.uuid);
      characteristics.push(c);

      result = attachCharacteristicPromise(result, c);
    }
    return result.then(()=>log("Handled characteristics"));
  };

  let createServicePromise = function(service) {
    log("Create service promise", service.uuid);
    let result = Promise.resolve();
    result = result.then(()=>{
      log("Handling service", service.uuid);
      return service.getCharacteristics().then((c)=>createCharacteristicsPromise(c));
    });
    return result.then(()=>log("Handled service", service.uuid));
  };

  let attachServicePromise = function(promise, service) {
    return promise.then(()=>createServicePromise(service));
  };

  function cacheDevice(deviceId){
    let promise;
    let filters;
    let gatt;
    characteristics = [];
    filters = [{ id: deviceId }];

    log("Requesting device with filters", filters);
    promise = NRF.requestDevice({ filters: filters, active: settings.active });

    promise = promise.then((d)=>{
      log("Got device", d);
      gatt = d.gatt;
      log("Connecting...");
      return gatt.connect().then(function() {
        log("Connected.");
      });
    });

    if (settings.bonding){
      promise = promise.then(() => {
        log(JSON.stringify(gatt.getSecurityStatus()));
        if (gatt.getSecurityStatus().bonded) {
          log("Already bonded");
          return Promise.resolve();
        } else {
          log("Start bonding");
          return gatt.startBonding()
            .then(() => log("Security status after bonding" + gatt.getSecurityStatus()));
        }
      });
    }

    promise = promise.then(()=>{
      log("Getting services");
      return gatt.getPrimaryServices();
    });

    promise = promise.then((services)=>{
      log("Got services", services.length);
      let result = Promise.resolve();
      for (let service of services){
        if (!(supportedServices.includes(service.uuid))) continue;
        log("Supporting service", service.uuid);
        result = attachServicePromise(result, service);
      }
      return result;
    });

    return promise.then(()=>{
      log("Connection established, saving cache");
      characteristicsToCache(characteristics);
    });
  }

  function createMenuFromScan(){
    E.showMenu();
    E.showMessage("Scanning for 4 seconds");

    let submenu_scan = {
      '< Back': function() { E.showMenu(buildMainMenu()); }
    };
    NRF.findDevices(function(devices) {
      submenu_scan[''] = { title: `Scan (${devices.length} found)`};
      if (devices.length === 0) {
        E.showAlert("No devices found")
          .then(() => E.showMenu(buildMainMenu()));
        return;
      } else {
        devices.forEach((d) => {
          log("Found device", d);
          let shown = (d.name || d.id.substr(0, 17));
          submenu_scan[shown] = function () {
            E.showPrompt("Connect to\n" + shown + "?", {title: "Pairing"}).then((r) => {
              if (r) {
                E.showMessage("Connecting...", {img:require("Storage").read("bthrm.img")});
                let count = 0;
                const successHandler = ()=>{
                  E.showPrompt("Success!", {
                    img:require("Storage").read("bthrm.img"),
                    buttons: { "OK":true }
                  }).then(()=>{
                  writeSettings("btid", d.id);
                  // Store the name for displaying later. Will connect by ID
                  if (d.name) {
                    writeSettings("btname", d.name);
                  }
                    E.showMenu(buildMainMenu());
                  });
                };
                const errorHandler = (e)=>{
                  count++;
                  log("ERROR", e);
                  if (count <= 10){
                    E.showMessage("Error during caching\nRetry " + count + "/10", e);
                    return cacheDevice(d.id).then(successHandler).catch(errorHandler);
                  } else {
                    E.showAlert("Error during caching", e).then(()=>{
                      E.showMenu(buildMainMenu());
                    });
                  }
                };

                return cacheDevice(d.id).then(successHandler).catch(errorHandler);
              }
            });
          };
        });
      }
      E.showMenu(submenu_scan);
    }, { timeout: 4000, active: true, filters: [{services: [ "180d" ]}]});
  }

  let submenu_custom = {
    '' : { title: "Custom mode"},
    '< Back': function() { E.showMenu(buildMainMenu()); },
    'Replace HRM': {
      value: !!settings.custom_replace,
      onchange: v => {
        writeSettings("custom_replace",v);
        if (settings.mode == 3) applyCustomSettings();
      }
    },
    'Start w. HRM': {
      value: !!settings.custom_startWithHrm,
      onchange: v => {
        writeSettings("custom_startWithHrm",v);
        if (settings.mode == 3) applyCustomSettings();
      }
    },
    'HRM Fallback': {
      value: !!settings.custom_allowFallback,
      onchange: v => {
        writeSettings("custom_allowFallback",v);
        if (settings.mode == 3) applyCustomSettings();
      }
    },
    'Fallback Timeout': {
      value: settings.custom_fallbackTimeout,
      min: 5,
      max: 60,
      step: 5,
      format: v=>v+"s",
      onchange: v => {
        writeSettings("custom_fallbackTimout",v*1000);
        if (settings.mode == 3) applyCustomSettings();
      }
    },
  };

  let submenu_grace = {
    '' : { title: "Grace periods"},
    '< Back': function() { E.showMenu(submenu_debug); },
    'Request': {
      value: settings.gracePeriodRequest,
      min: 0,
      max: 3000,
      step: 100,
      format: v=>v+"ms",
      onchange: v => {
        writeSettings("gracePeriodRequest",v);
      }
    },
    'Connect': {
      value: settings.gracePeriodConnect,
      min: 0,
      max: 3000,
      step: 100,
      format: v=>v+"ms",
      onchange: v => {
        writeSettings("gracePeriodConnect",v);
      }
    },
    'Notification': {
      value: settings.gracePeriodNotification,
      min: 0,
      max: 3000,
      step: 100,
      format: v=>v+"ms",
      onchange: v => {
        writeSettings("gracePeriodNotification",v);
      }
    }
  };

  E.showMenu(buildMainMenu());
});
