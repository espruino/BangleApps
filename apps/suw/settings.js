(function(back) {
  var FILE = "suw.json";
  // Load settings
  var settings = Object.assign({
    nextTideType: "high",
    nextTideHour: 0,
    nextTideMin: 0,
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
  
  // Show the menu
  E.showMenu({
    "" : { "title" : "Seaside Watch" },
    "< Back" : () => back(),
     "Tide type": stringInSettings("nextTideType", ["high", "low "]),
    'Hour': {
      value: 0|settings.nextTideHour,  // 0| converts undefined to 0
      min: 0, max: 23,
      onchange: v => {
        settings.nextTideHour = v;
        writeSettings();
      }
    },
    'Minutes': {
      value: 0|settings.nextTideMin,  // 0| converts undefined to 0
      min: 0, max: 59,
      onchange: v => {
        settings.nextTideMin = v;
        writeSettings();
      }
    },
  });
});
