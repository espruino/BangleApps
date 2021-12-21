(function () {
  var DEBUG = true;
  var FILE = "swp2clk.data.json";

  var main = () => {
    var settings = readSettings();

    if (settings.addSwipeHandler) {
      var swipeHandler = (dir) => {
        log("swipe");
        log(dir);
        if (dir === 1) {
          load();
        }
      };
      Bangle.on("swipe", swipeHandler);
    }

    var global_load = global.load;
    global.load = (fileName) => {
      log("loading filename!");
      log(fileName);
      var settings = readSettings();

      if (fileName) {
        // "Off"
        if (settings.mode === 0) {
          settings.addSwipeHandler = false;
        }

        // "White List"
        if (settings.mode === 1) {
          if (settings.whiteList.indexOf(fileName) >= 0) {
            settings.addSwipeHandler = true;
          } else {
            settings.addSwipeHandler = false;
          }
        }

        // "Black List"
        if (settings.mode === 2) {
          if (settings.blackList.indexOf(fileName) >= 0) {
            settings.addSwipeHandler = false;
          } else {
            settings.addSwipeHandler = true;
          }
        }

        // "Always"
        if (settings.mode === 3) {
          settings.addSwipeHandler = true;
        }
      } else {
        // Clock will load
        settings.addSwipeHandler = false;
      }

      writeSettings(settings);
      global_load(fileName);
    };
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
      mode: 0,
      whiteList: [],
      blackList: [],
      addSwipeHandler: false,
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

  main();
})();
