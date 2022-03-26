(function() {
    var settings = Object.assign(require("Storage").readJSON("quicklaunch.json", true) || {});
    
    if (!settings.leftapp) {
      settings["leftapp"] = {"name":"(none)"};
      require("Storage").write("quicklaunch.json",settings);
    }
    if (!settings.rightapp) {
      settings["rightapp"] = {"name":"(none)"};
      require("Storage").write("quicklaunch.json",settings);
    }

    var sui = Bangle.setUI;
    Bangle.setUI = function(mode, cb) {
        sui(mode,cb);
        if(!mode) return;
        if ("object"==typeof mode) mode = mode.mode;
        if (!mode.startsWith("clock")) return;
        Bangle.swipeHandler = dir => { 
          if ((dir<0) && (settings.leftapp.src)) load(settings.leftapp.src); 
          if ((dir>0) && (settings.rightapp.src)) load(settings.rightapp.src);
          };
        Bangle.on("swipe", Bangle.swipeHandler);
    };
})();
