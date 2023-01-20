(function () {
  var settings = require("Storage").readJSON("backswipe.json", 1) || {};

  // Overrride the default setUI method, so we can save the back button callback
  var setUI = Bangle.setUI;
  Bangle.setUI = function (mode, cb) {
    var options = {};
    if ("object"==typeof mode) {
      options = mode;
    }

    var currentFile = global.__FILE__ || "";

    print("Setting UI");
    if(global.BACK) delete global.BACK;
    if (options && options.back && enabledForApp(currentFile)) {
      print("Saving back callback");
      global.BACK = options.back;
    }
    setUI(mode, cb);
  };

  function goBack(lr, ud) {
    // if it is a left to right swipe
    if (lr === 1) {
      print("Back swipe detected");
      // if we're in an app that has a back button, run the callback for it
      if (global.BACK) {
        print("Running back callback");
        global.BACK();
      }
    }
  }

  function enabledForApp(app) {
    if (!settings) return true;
    if (settings.mode === "blacklist") {
      return !settings.apps.includes(app);
    } else if (settings.mode === "whitelist") {
      return settings.apps.includes(app);
    } else {
      return settings.mode === "on" ? true : false;
    }
  }
  
  // Listen to left to right swipe
  Bangle.on("swipe", goBack);
})();
