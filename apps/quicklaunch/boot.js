(function() {
  var settings = Object.assign(require("Storage").readJSON("quicklaunch.json", true) || {});

  //list all sources
  var apps = require("Storage").list(/\.info$/).map(app=>{var a=require("Storage").readJSON(app,1);return a&&{src:a.src};});
  
  //populate empty app list
      
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

  //activate on clock faces
  var sui = Bangle.setUI;
  Bangle.setUI = function(mode, cb) {
    sui(mode,cb);
    if(!mode) return;
    if ("object"==typeof mode) mode = mode.mode;
    if (!mode.startsWith("clock")) return;

  function tap() {
    //tap, check if source exists, launch
    if ((settings.tapapp.src) && apps.some(e => e.src === settings.tapapp.src)) load (settings.tapapp.src);
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
      //horizontal swipes, check if source exists, launch
      if (Math.abs(dx)>Math.abs(dy)+10) {
        if ((settings.leftapp.src) && apps.some(e => e.src === settings.leftapp.src) && dx<0) load(settings.leftapp.src);
        if ((settings.rightapp.src) && apps.some(e => e.src === settings.rightapp.src) && dx>0) load(settings.rightapp.src);
      } 
      //vertical swipes, check if source exists, launch
      else if (Math.abs(dy)>Math.abs(dx)+10) {
        if ((settings.upapp.src) && apps.some(e => e.src === settings.upapp.src) && dy<0) load(settings.upapp.src);
        if ((settings.downapp.src) && apps.some(e => e.src === settings.downapp.src) && dy>0) load(settings.downapp.src);
      }
    }
  });

  };
})();
