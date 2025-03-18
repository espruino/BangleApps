// Settings menu for the enhanced Anton clock

(function(back) {
  var FILE = "antonclk.json";
  var settings = Object.assign({
    secondsOnUnlock: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Helper method which uses int-based menu item for set of string values
  function stringItems(startvalue, writer, values) {
    return {
      value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
      format: v => values[v],
      min: 0,
      max: values.length - 1,
      wrap: true,
      step: 1,
      onchange: v => {
        writer(values[v]);
        writeSettings();
      }
    };
  }

  // Helper method which breaks string set settings down to local settings object
  function stringInSettings(name, values) {
    return stringItems(settings[name], v => settings[name] = v, values);
  }

  var mainmenu = {
    "": {
      "title": "Anton clock"
    },
    "< Back": () => back(),
    "Seconds...": () => E.showMenu(secmenu),
    "Date": stringInSettings("dateOnMain", ["Long", "Short", "ISO8601"]),
    "Show Weekday": {
      value: (settings.weekDay !== undefined ? settings.weekDay : true),
      onchange: v => {
        settings.weekDay = v;
        writeSettings();
      }
    },
    "Show CalWeek": {
      value: (settings.calWeek !== undefined ? settings.calWeek : false),
      onchange: v => {
        settings.calWeek = v;
        writeSettings();
      }
    },
    "Uppercase": {
      value: (settings.upperCase !== undefined ? settings.upperCase : true),
      onchange: v => {
        settings.upperCase = v;
        writeSettings();
      }
    },
    "Vector font": {
      value: (settings.vectorFont !== undefined ? settings.vectorFont : false),
      onchange: v => {
        settings.vectorFont = v;
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
    "Show": stringInSettings("secondsMode", ["Never", "Unlocked", "Always"]),
    "With \":\"": {
      value: (settings.secondsWithColon !== undefined ? settings.secondsWithColon : true),
      onchange: v => {
        settings.secondsWithColon = v;
        writeSettings();
      }
    },
    "Color": {
      value: (settings.secondsColoured !== undefined ? settings.secondsColoured : true),
      onchange: v => {
        settings.secondsColoured = v;
        writeSettings();
      }
    },
    "Date": stringInSettings("dateOnSecs", ["Year", "Weekday", "No"])
  };

  E.showMenu(mainmenu);

})
