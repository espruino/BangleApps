(function (back) {
  var DEBUG = false;
  var FILE = "touchtimer.data.json";

  var settings = {};

  var showMainMenu = () => {
    log("Loading main menu");

    E.showMenu({
      "": { title: "Touch Timer" },
      "< Back": () => back(),
      "Buzz Count": {
        value: settings.buzzCount,
        min: 1,
        max: 3,
        step: 1,
        onchange: (value) => {
          settings.buzzCount = value;
          writeSettings(settings);
        },
      },
      "Buzz Duration": {
        value: settings.buzzDuration,
        min: 1,
        max: 10,
        step: 0.5,
        format: (value) => value + "s",
        onchange: (value) => {
          settings.buzzDuration = value;
          writeSettings(settings);
        },
      },
      "CountDown Buzz": {
        value: !!settings.countDownBuzz,
        onchange: (value) => {
          settings.countDownBuzz = value;
          writeSettings(settings);
        },
      },
      "Pause Between": {
        value: settings.pauseBetween,
        min: 1,
        max: 5,
        step: 1,
        format: (value) => value + "s",
        onchange: (value) => {
          settings.pauseBetween = value;
          writeSettings(settings);
        },
      },
    });
  };

  // lib functions

  var log = (message) => {
    if (DEBUG) {
      console.log(JSON.stringify(message));
    }
  };

  var readSettings = () => {
    log("reading settings");
    var settings = require("Storage").readJSON(FILE, 1) || {
      buzzCount: 3,
      buzzDuration: 1,
      pauseBetween: 1,
    };
    log(settings);
    return settings;
  };

  var writeSettings = (settings) => {
    log("writing settings");
    log(settings);
    require("Storage").writeJSON(FILE, settings);
  };

  // start main function

  settings = readSettings();
  showMainMenu();
})
