(function() {
  var sui = Bangle.setUI;
  var oldSwipe;

  Bangle.setUI = function(mode, cb) {
    if (oldSwipe) {
      Bangle.removeListener("swipe", oldSwipe);
      oldSwipe = undefined;
    }

    sui(mode,cb);

    if (Bangle.CLOCK) {
      // clock -> launcher
      oldSwipe = dir => { if (dir<0) Bangle.showLauncher(); };
      Bangle.on("swipe", oldSwipe);
    } else if (global.__FILE__ && __FILE__.endsWith(".app.js") && (require("Storage").readJSON(__FILE__.slice(0,-6)+"info",1)||{}).type==="launch") {
      // launcher -> clock
      oldSwipe = dir => { if (dir>0) load(); };
      Bangle.on("swipe", oldSwipe);
    }
  };
})();
