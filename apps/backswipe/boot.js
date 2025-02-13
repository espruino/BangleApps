(function () {
  var DEFAULTS = {
    mode: 0,
    apps: [],
  };
  var settings = require("Storage").readJSON("backswipe.json", 1) || DEFAULTS;

  // Overrride the default setUI method, so we can save the back button callback
  var setUI = Bangle.setUI;
  Bangle.setUI = function (mode, cb) {
    var options = {};
    if ("object"==typeof mode) {
      options = mode;
    }

    var currentFile = global.__FILE__ || "";

    if (global.BACK) delete global.BACK;
    if (options && options.back && enabledForApp(currentFile)) {
      global.BACK = options.back;
    }
    setUI(mode, cb);
  };

  function countHandlers(eventType) {
    if (Bangle["#on"+eventType] === undefined) {
      return 0;
    } else if (Bangle["#on"+eventType] instanceof Array) {
      return Bangle["#on"+eventType].filter(x=>x).length;
    } else if (Bangle["#on"+eventType] !== undefined) {
      return 1;
    }
  }

  function goBack(lr, _) {
    // if it is a left to right swipe
    if (lr === 1) {
      // if we're in an app that has a back button, run the callback for it
      if (global.BACK && countHandlers("swipe")<=settings.standardNumSwipeHandlers && countHandlers("drag")<=settings.standardNumDragHandlers) {
        global.BACK();
        E.stopEventPropagation();
      }
    }
  }

  // Check if the back button should be enabled for the current app
  // app is the src file of the app
  function enabledForApp(app) {
    if (!settings) return true;
    if (settings.mode === 0) {
      return !(settings.apps.filter((a) => (a.src===app)||(a.files&&a.files.includes(app))).length > 0); // The `a.src===app` and `a.files&&...` checks are for backwards compatibility. Otherwise only `a.files.includes(app)` is needed.
    } else if (settings.mode === 1) {
      return settings.apps.filter((a) => (a.src===app)||(a.files&&a.files.includes(app))).length > 0;
    } else {
      return settings.mode === 2 ? true : false;
    }
  }

  // Listen to left to right swipe
  Bangle.prependListener("swipe", goBack);
})();
