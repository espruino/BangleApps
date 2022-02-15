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
            writeSettings("debuglog",false);
            writeSettings("startWithHrm",true);
            writeSettings("allowFallback",true);
            writeSettings("fallbackTimeout",10);
            break;
          case 2:
            writeSettings("enabled",true);
            writeSettings("replace",false);
            writeSettings("debuglog",false);
            writeSettings("startWithHrm",false);
            writeSettings("allowFallback",false);
            break;
          case 3:
            writeSettings("enabled",true);
            writeSettings("replace",settings.custom_replace);
            writeSettings("debuglog",settings.custom_debuglog);
            writeSettings("startWithHrm",settings.custom_startWithHrm);
            writeSettings("allowFallback",settings.custom_allowFallback);
            writeSettings("fallbackTimeout",settings.custom_fallbackTimeout);
            break;
        }
        writeSettings("mode",v);
      }
    },
    'Custom Mode': function() { E.showMenu(submenu_custom); },
    'Debug': function() { E.showMenu(submenu_debug); }
  };
  
  var submenu_debug = {
    '' : { title: "Debug"},
    '< Back': function() { E.showMenu(mainmenu); },
    'Alert on disconnect': {
      value: !!settings.warnDisconnect,
      format: v => settings.warnDisconnect ? "On" : "Off",
      onchange: v => {
        writeSettings("warnDisconnect",v);
      }
    },
    'Debug log': {
      value: !!settings.debuglog,
      format: v => settings.debuglog ? "On" : "Off",
      onchange: v => {
        writeSettings("debuglog",v);
      }
    },
    'Grace periods': function() { E.showMenu(submenu_grace); }
  };
  
  var submenu_custom = {
    '' : { title: "Custom mode"},
    '< Back': function() { E.showMenu(mainmenu); },
    'Replace HRM': {
      value: !!settings.custom_replace,
      format: v => settings.custom_replace ? "On" : "Off",
      onchange: v => {
        writeSettings("custom_replace",v);
      }
    },
    'Start w. HRM': {
      value: !!settings.custom_startWithHrm,
      format: v => settings.custom_startWithHrm ? "On" : "Off",
      onchange: v => {
        writeSettings("custom_startWithHrm",v);
      }
    },
    'HRM Fallback': {
      value: !!settings.custom_allowFallback,
      format: v => settings.custom_allowFallback ? "On" : "Off",
      onchange: v => {
        writeSettings("custom_allowFallback",v);
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
  
  var submenu = {
    '' : { title: "Grace periods"},
    '< Back': function() { E.showMenu(mainmenu); },
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
  
  E.showMenu(mainmenu);
})
