/**
 * How does this work?
 * 
 * Every *boot.js file is executed everytime any app is loaded, including this one.
 * We just need to figure out which app is currently loaded, in case we are in the white list / black list mode,
 * to figure out if the swipe handler should be attached or not.
 * It does not seem to be the case that this can be done easily, but we can work around it.
 * It seems that every app is loaded via the global "load" function, which takes a fileName as it's first parameter to load any app
 * or the default clock when the fileName is undefined.
 * To be able to use this for us, we wrap the global "load" function, and determine before loading the next app,
 * whether the swipe handler should be added or not, since we now know which app will be loaded.
 * Note: We cannot add the swipe handler inside the wrapped "load" function, because once the "load" function is complete
 * everything is cleaned up. That's why we merely save a flag, whether the swipe handler should be attached or not,
 * which is evaluated once this file is executed again, which will be right after the load function completes
 * (since every *boot.js file is executed everytime any app is loaded).
 */

(function () {
  var DEBUG = false;
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
