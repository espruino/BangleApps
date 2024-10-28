/**
 * @param {function} back Use back() to return to settings menu
 */

(function (back) {
  // default to buzzing
  var FILE = "chimer.json";
  var settings = {};
  const chimes = ["Off", "Buzz", "Beep", "Both"];
  const frequency = ["60 min", "30 min", "15 min", "1 min"];

  var showMainMenu = () => {
    E.showMenu({
      "": { title: "Chimer" },
      "< Back": () => back(),
      "Chime Type": {
        value: settings.type,
        min: 0,
        max: 2, // both is just silly
        format: (v) => chimes[v],
        onchange: (v) => {
          settings.type = v;
          writeSettings(settings);
        },
      },
      Frequency: {
        value: settings.freq,
        min: 0,
        max: 2,
        format: (v) => frequency[v],
        onchange: (v) => {
          settings.freq = v;
          writeSettings(settings);
        },
      },
      Repetition: {
        value: settings.repeat,
        min: 1,
        max: 5,
        format: (v) => v,
        onchange: (v) => {
          settings.repeat = v;
          writeSettings(settings);
        },
      },
      "Sleep Mode": {
        value: !!settings.sleep,
        onchange: (v) => {
          settings.sleep = v;
          writeSettings(settings);
        },
      },
      "Sleep Start": {
        value: settings.start,
        min: 0,
        max: 23,
        format: (v) => v,
        onchange: (v) => {
          settings.start = v;
          writeSettings(settings);
        },
      },
      "Sleep End": {
        value: settings.end,
        min: 0,
        max: 23,
        format: (v) => v,
        onchange: (v) => {
          settings.end = v;
          writeSettings(settings);
        },
      },
    });
  };

  var readSettings = () => {
    var settings = require("Storage").readJSON(FILE, 1) || {
      type: 1,
      freq: 0,
      repeat: 1,
      sleep: true,
      start: 6,
      end: 22,
    };
    return settings;
  };

  var writeSettings = (settings) => {
    require("Storage").writeJSON(FILE, settings);
  };

  settings = readSettings();
  showMainMenu();
})
