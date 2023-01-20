(function () {
  // Overrride the default setUI method, so we can save the back button callback
  var setUI = Bangle.setUI;
  Bangle.setUI = function (mode, cb) {
    var options = {};
    if ("object"==typeof mode) {
      options = mode;
    }

    print("Setting UI");
    if(global.BACK) delete global.BACK;
    if (options && options.back) {
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

  // Listen to left to right swipe
  Bangle.on("swipe", goBack);
})();
