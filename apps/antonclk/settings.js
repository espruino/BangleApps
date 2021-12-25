// Settings menu for the enhanced Anton clock

(function(back) {
  var FILE = "antonclk.json";
  // Load settings
  var settings = Object.assign({
    secondsOnUnlock: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  var mainmenu = {
    "": {
      "title": "Anton clock"
    },
    "< Back": () => back(),
    "Seconds...": () => E.showMenu(secmenu),
    "ISO8601 date": {
      value: (settings.dateAsISO !== undefined ? settings.dateAsISO : false),
      format: v => v ? "On" : "Off",
      onchange: v => {
        settings.dateAsISO = v;
        writeSettings();
      }
    },
    "Long date": {
      value: (settings.longDate !== undefined ? settings.longDate : true),
      format: v => v ? "On" : "Off",
      onchange: v => {
        settings.longDate = v;
        writeSettings();
      }
    },
    "Show Weekday": {
      value: (settings.weekDay !== undefined ? settings.weekDay : true),
      format: v => v ? "On" : "Off",
      onchange: v => {
        settings.weekDay = v;
        writeSettings();
      }
    },
    "Uppercase": {
      value: (settings.upperCase !== undefined ? settings.upperCase : false),
      format: v => v ? "On" : "Off",
      onchange: v => {
        settings.upperCase = v;
        writeSettings();
      }
    },
  };

  // Submenu
  var secmenu = {
    "": {
      "title": "Show seconds..."
    },
    "< Back": () => E.showMenu(mainmenu),
    "Always": {
      value: (settings.secondsAlways !== undefined ? settings.secondsAlways : false),
      format: v => v ? "On" : "Off",
      onchange: v => {
        settings.secondsAlways = v;
        writeSettings();
      }
    },
    "If unlocked": {
      value: (settings.secondsOnUnlock !== undefined ? settings.secondsOnUnlock : false),
      format: v => v ? "On" : "Off",
      onchange: v => {
        settings.secondsOnUnlock = v;
        writeSettings();
      }
    },
    "Coloured": {
      value: (settings.secondsColoured !== undefined ? settings.secondsColoured : false),
      format: v => v ? "On" : "Off",
      onchange: v => {
        settings.secondsColoured = v;
        writeSettings();
      }
    },
    "With date": {
      value: (settings.dateOnSecs !== undefined ? settings.dateOnSecs : false),
      format: v => v ? "On" : "Off",
      onchange: v => {
        settings.dateOnSecs = v;
        writeSettings();
      }
    }
  };

  // Actually display the menu
  E.showMenu(mainmenu);

});

// end of file
