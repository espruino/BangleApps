(function (back) {
  // settings menu for Monogram Watch Face
  // Anton Clock settings were used as template
  // helper functions taken from Anton Clock  
  
  var FILE = "smclock.json";
  // load settings from the file
  // assign default values if it doesn't exist
  var settings = Object.assign({
      dateFormat: "Short",
      drawInterval: 10,
      pollInterval: 60,
      showAnalogFace: false,
      showWeekInfo: false,
      useVectorFont: false,
    }, require("Storage").readJSON(FILE, true) || {});

  // write the new settings to the file
  function writeSettings() {require("Storage").writeJSON(FILE, settings);}

  // helper method which uses int-based menu item for set of string values
  function stringItems(startvalue, writer, values) {
    return {
      value: startvalue === undefined ? 0 : values.indexOf(startvalue),
      format: v => values[v],
      min: 0,
      max: values.length - 1,
      wrap: true,
      step: 1,
      onchange: v => {
        writer(values[v]);
        writeSettings();
      },
    };
  }

  // helper method which breaks string set settings down to local settings object
  function stringInSettings(name, values) {
    return stringItems(settings[name], (v) => (settings[name] = v), values);
  }

  // settings menu
  var mainmenu = {
    "": {title: "Monogram Clock",},
    "< Back": () => back(),
    "Analog Face": {
      value:
        settings.showAnalogFace !== undefined ? settings.showAnalogFace : false,
      onchange: v => {
        settings.showAnalogFace = v;
        writeSettings();
      },
    },
    "Background": stringInSettings("backgroundImage", ["3bit", "4bit"]),
    Date: stringInSettings("dateFormat", ["Long", "Short"]),
    "Draw Interval": {
      value: settings.drawInterval,
      onchange: v => {
        settings.drawInterval = v;
        writeSettings();
      },
    },
    "Poll Interval": {
      value: settings.pollInterval,
      onchange: v => {
        settings.pollInterval = v;
        writeSettings();
      },
    },
    "Week Info": {
      value:
        settings.showWeekInfo !== undefined ? settings.showWeekInfo : false,
      onchange: v => {
        settings.showWeekInfo = v;
        writeSettings();
      },
    },
    "Vector Font": {
      value:
        settings.useVectorFont !== undefined ? settings.useVectorFont : false,
      onchange: v => {
        settings.useVectorFont = v;
        writeSettings();
      },
    },
  };

  // Actually display the menu
  E.showMenu(mainmenu);
})
