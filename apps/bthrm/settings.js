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
    'Use BT HRM': {
      value: !!settings.enabled,
      format: v => settings.enabled ? "On" : "Off",
      onchange: v => {
        writeSettings("enabled",v);
      }
    },
    'Replace HRM': {
      value: !!settings.replace,
      format: v => settings.replace ? "On" : "Off",
      onchange: v => {
        writeSettings("replace",v);
      }
    },
    'Start with HRM': {
      value: !!settings.startWithHrm,
      format: v => settings.startWithHrm ? "On" : "Off",
      onchange: v => {(function(back) {
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
    'Use BT HRM': {
      value: !!settings.enabled,
      format: v => settings.enabled ? "On" : "Off",
      onchange: v => {
        writeSettings("enabled",v);
      }
    },
    'Replace HRM': {
      value: !!settings.replace,
      format: v => settings.replace ? "On" : "Off",
      onchange: v => {
        writeSettings("replace",v);
      }
    },
    'Start w. HRM': {
      value: !!settings.startWithHrm,
      format: v => settings.startWithHrm ? "On" : "Off",
      onchange: v => {
        writeSettings("startWithHrm",v);
      }
    },
    'HRM Fallback': {
      value: !!settings.allowFallback,
      format: v => settings.allowFallback ? "On" : "Off",
      onchange: v => {
        writeSettings("allowFallback",v);
      }
    },
    'Fallback Timeout': {
      value: settings.fallbackTimeout,
      min: 5,
      max: 60,
      step: 5,
      format: v=>v+"s",
      onchange: v => {
        writeSettings("fallbackTimout",v*1000);
      }
    },
    'Conn. Alert': {
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
    'Grace periods >': function() { E.showMenu(submenu); }
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
        writeSettings("startWithHrm",v);
      }
    },
    'Fallback to HRM': {
      value: !!settings.allowFallback,
      format: v => settings.allowFallback ? "On" : "Off",
      onchange: v => {
        writeSettings("allowFallback",v);
      }
    },
    'Fallback Timeout': {
      value: settings.fallbackTimeout,
      min: 5,
      max: 60,
      step: 5,
      format: v=>v+"s",
      onchange: v => {
        writeSettings("fallbackTimout",v*1000);
      }
    },
    'Conn. Alert': {
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
    'Grace periods': function() { E.showMenu(submenu); }
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
