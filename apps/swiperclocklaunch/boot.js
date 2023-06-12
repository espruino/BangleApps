(function() {
  var sui = Bangle.setUI;
  var oldSwipe;

  Bangle.setUI = function(mode, cb) {
    if (oldSwipe && oldSwipe !== Bangle.swipeHandler)
      Bangle.removeListener("swipe", oldSwipe);
    sui(mode,cb);
    oldSwipe = Bangle.swipeHandler;

    if(!mode) return;
    if ("object"==typeof mode) mode = mode.mode;
    if (mode.startsWith("clock")) {
      // clock -> launcher
      Bangle.swipeHandler = dir => { if (dir<0) Bangle.showLauncher(); };
      Bangle.on("swipe", Bangle.swipeHandler);
    } else {
      if (global.__FILE__ && __FILE__.endsWith(".app.js") && (require("Storage").readJSON(__FILE__.slice(0,-6)+"info",1)||{}).type=="launch") {
        // launcher -> clock
        Bangle.swipeHandler = dir => { if (dir>0) load(); };
        Bangle.on("swipe", Bangle.swipeHandler);
      }
    }
  };
})();
