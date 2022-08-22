/**
 * @param {function} back Use back() to return to settings menu
 */



(function(back) {
  // default to buzzing
  var FILE = "chimer.json"
  var settings = {}
  const chimes = ["Off", "Buzz", "Beep", "Both"]
  const frequency = ["60 min", "30 min", "15 min"]



  const menu = {
    "": {"title": "Hour Chime"},
    "< Back": back,
    "Chime Type": {
      value: settings.type,
      min: 0, max: 2, // both is just silly
      format: v => chimes[v],
      onchange: function(v) {
        settings.type = v
        writeSettings(settings)
      },
    },
    "Frequency": {
      value: settings.freq,
      min: 0, max: 2,
      format: v => frequency[v],
      onchange : function(v) {
        settings.freq = v
        writeSettings(settings)
      }
    }
  }


  var readSettings = () => {
    var settings = require("Storage").readJSON(FILE, 1) || {
      type: 1,
      freq: 0,
    };
    return settings;
  };

  var writeSettings = (settings) => {
    require("Storage").writeJSON(FILE, settings);
  };
  settings = readSettings()
  E.showMenu(menu)
})

