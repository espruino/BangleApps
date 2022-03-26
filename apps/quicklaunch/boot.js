(function() {
    var sui = Bangle.setUI;
    Bangle.setUI = function(mode, cb) {
        sui(mode,cb);
        if(!mode) return;
        if ("object"==typeof mode) mode = mode.mode;
        if (!mode.startsWith("clock")) return;
        Bangle.swipeHandler = dir => { if (dir<0) Bangle.showLauncher(); };
        Bangle.on("swipe", Bangle.swipeHandler);
    };
})();
