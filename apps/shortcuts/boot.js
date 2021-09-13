(function() {
  var sui = Bangle.setUI;
  Bangle.setUI = function(mode, cb) {
    if (mode!="clock") return sui(mode,cb);
    return sui("clockupdown", (dir) => {
      let settings = require("Storage").readJSON("shortcuts.json", 1)||{};
      console.log(settings);
      if (dir == -1) {
        if (settings.BTN1) load(settings.BTN1);
      } else if (dir == 1) {
        if (settings.BTN3) load(settings.BTN3);
      }
    });
  };
})();
  