(function(back) {
  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
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

  var FILE="bthrm.json";
  var settings;
  readSettings();

  function applyCustomSettings(){
    writeSettings("enabled",true);
    writeSettings("replace",settings.custom_replace);
    writeSettings("startWithHrm",settings.custom_startWithHrm);
    writeSettings("allowFallback",settings.custom_allowFallback);
    writeSettings("fallbackTimeout",settings.custom_fallbackTimeout);
  }

  function buildMainMenu(){
    var mainmenu = {
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
      var name = "Clear " + (settings.btname || settings.btid);
      mainmenu[name] = function() {
      E.showPrompt("Clear current device?").then((r)=>{
          if (r) {
            writeSettings("btname",undefined);
            writeSettings("btid",undefined);
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

  var submenu_debug = {
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

  function createMenuFromScan(){
    E.showMenu();
    E.showMessage("Scanning for 4 seconds");

    var submenu_scan = {
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
          print("Found device", d);
          var shown = (d.name || d.id.substr(0, 17));
          submenu_scan[shown] = function () {
            E.showPrompt("Set " + shown + "?").then((r) => {
              if (r) {
                writeSettings("btid", d.id);
                // Store the name for displaying later. Will connect by ID
                if (d.name) {
                  writeSettings("btname", d.name);
                }
              }
              E.showMenu(buildMainMenu());
            });
          };
        });
      }
      E.showMenu(submenu_scan);
    }, { timeout: 4000, active: true, filters: [{services: [ "180d" ]}]});
  }

  var submenu_custom = {
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

  var submenu_grace = {
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
    },
    'Service': {
      value: settings.gracePeriodService,
      min: 0,
      max: 3000,
      step: 100,
      format: v=>v+"ms",
      onchange: v => {
        writeSettings("gracePeriodService",v);
      }
    }
  };

  E.showMenu(buildMainMenu());
});
