// clock -> launcher
(function() {
    var sui = Bangle.setUI;
    Bangle.setUI = function(mode, cb) {
        sui(mode,cb);
        if(!mode) return;
        if (!mode.startsWith("clock")) return;
        Bangle.swipeHandler = dir => { if (dir<0) Bangle.showLauncher(); };
        Bangle.on("swipe", Bangle.swipeHandler);
    };
})();
// launcher -> clock
setTimeout(function() {  
    if (global.__FILE__ && __FILE__.endsWith(".app.js") && (require("Storage").readJSON(__FILE__.slice(0,-6)+"info",1)||{}).type=="launch") {
        Bangle.swipeHandler = dir => { if (dir>0) load(); };
        Bangle.on("swipe", Bangle.swipeHandler);
    }
}, 10);
