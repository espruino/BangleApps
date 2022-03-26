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
    if (!settings.upapp) {
    settings["upapp"] = {"name":"(none)"};
    require("Storage").write("quicklaunch.json",settings);
  }
    if (!settings.downapp) {
    settings["downapp"] = {"name":"(none)"};
    require("Storage").write("quicklaunch.json",settings);
  }
    if (!settings.tapapp) {
    settings["tapapp"] = {"name":"(none)"};
    require("Storage").write("quicklaunch.json",settings);
  }

  var sui = Bangle.setUI;
  Bangle.setUI = function(mode, cb) {
    sui(mode,cb);
    if(!mode) return;
    if ("object"==typeof mode) mode = mode.mode;
    if (!mode.startsWith("clock")) return;

  function tap() {
    if (settings.tapapp.src) load (settings.tapapp.src);
  }
    
  let drag;
  let e;
  
  Bangle.on("touch",tap);
  Bangle.on("drag", e => {
    if (!drag) { // start dragging
      drag = {x: e.x, y: e.y};
    } else if (!e.b) { // released
      const dx = e.x-drag.x, dy = e.y-drag.y;
      drag = null;
      if ((Math.abs(dx)>Math.abs(dy)+10) && (settings.leftapp.src)) {
        // horizontal
        load(dx>0 ? settings.rightapp.src : settings.leftapp.src);
      } 
      else if (Math.abs(dy)>Math.abs(dx)+10) {
        // vertical
        load(dy>0 ? settings.downapp.src : settings.upapp.src);
      }
    }
  });

  };
})();
