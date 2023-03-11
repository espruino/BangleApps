{
  const storage = require("Storage");
  let settings = storage.readJSON("quicklaunch.json", true) || {};

  let reset = function(name){
    if (!settings[name]) settings[name] = {"name":"(none)"};
    if (!storage.read(settings[name].src)) settings[name] = {"name":"(none)"};
    storage.write("quicklaunch.json", settings);
  };

  // l=left, r=right, u=up, d=down, t=tap.

  let touchHandler = (_,e) => {
    let R = Bangle.appRect;
    if (e.x < R.x || e.x > R.x2 || e.y < R.y || e.y > R.y2 ) return;
    qlTrace += "t";
    if (settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
  };

  let swipeHandler = (lr,ud) => {
    if (lr == -1) qlTrace += "l"; // l=left, 
    if (lr == 1) qlTrace += "r"; // r=right,
    if (ud == -1) qlTrace += "u"; // u=up,
    if (ud == 1) qlTrace += "d"; // d=down.
    if (lr == -1 && settings[qlTrace+"app"] && settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
    if (lr == 1 && settings[qlTrace+"app"] && settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
    if (ud == -1 && settings[qlTrace+"app"] && settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
    if (ud == 1 && settings[qlTrace+"app"] && settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
  };

  Bangle.setUI({
    mode: "custom",
    touch: touchHandler,
    swipe : swipeHandler,
    remove: ()=>{if (timeoutToClock) clearTimeout(timeoutToClock);} // Compatibility with Fastload Utils.
  });

  g.clearRect(Bangle.appRect);
  Bangle.loadWidgets(); // Compatibility with Fastload Utils.

  // taken from Icon Launcher with some alterations
  let timeoutToClock;
  const updateTimeoutToClock = function(){
    let time = 1000; // milliseconds
    if (timeoutToClock) clearTimeout(timeoutToClock);
    timeoutToClock = setTimeout(load,time);
  };
  updateTimeoutToClock();
  
  let R = Bangle.appRect; 
  
  // Draw app hints
  g.setFont("Vector", 11)
    .setFontAlign(0,1,0).drawString(settings[qlTrace+"app"].name, R.x+R.w/2, R.y2)
    .setFontAlign(0,1,1).drawString(settings[qlTrace+"app"].name, R.x, R.y+R.h/2)
    .setFontAlign(0,-1,0).drawString(settings[qlTrace+"app"].name, R.x+R.w/2, R.y)
    .setFontAlign(0,1,3).drawString(settings[qlTrace+"app"].name, R.x2, R.y+R.h/2);
}
