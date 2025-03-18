(function(back) {
  var FILE = "hworldclock.json";
  var settings = Object.assign({
    secondsOnUnlock: false,
    rotationTarget: "90",
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
      "title": "Hanks World Clock"
    },
    "< Back": () => back(),
	"Seconds": stringInSettings("secondsMode", ["always", "when unlocked", "none"]),
	"Color w. dark": stringInSettings("colorWhenDark", ["green", "default"]),
  "1 Offset Small": {
    value: (settings.singleOffsetSmall !== undefined ? settings.singleOffsetSmall : false),
    onchange: v=> {
      settings.singleOffsetSmall = v;
      writeSettings();
    }
  },
  "Show SunInfo": {
    value: (settings.showSunInfo !== undefined ? settings.showSunInfo : true),
    onchange: v => {
      settings.showSunInfo = v;
      writeSettings();
    }
  },
	"Rotation": stringInSettings("rotationTarget", ["off", "90", "180", "270"]),
  };

  E.showMenu(mainmenu);

})