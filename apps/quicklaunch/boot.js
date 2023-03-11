{
  // TODO: Change the settings object and settings.js to match qlTrace.
  const storage = require("Storage");
  let settings = storage.readJSON("quicklaunch.json", true) || {};

  let reset = function(name){
    if (!settings[name]) settings[name] = {"name":"(none)"};
    if (!storage.read(settings[name].src)) settings[name] = {"name":"(none)"};
    storage.write("quicklaunch.json", settings);
  };

  Bangle.on("touch", (_,e) => {
    if (!Bangle.CLOCK) return;
    if (Bangle.CLKINFO_FOCUS) return;
    let R = Bangle.appRect;
    if (e.x < R.x || e.x > R.x2 || e.y < R.y || e.y > R.y2 ) return;
    qlTrace = "t"; // t=tap
    if (settings[qlTrace].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
  });
 
  
  Bangle.on("swipe", (lr,ud) => {
    if (!Bangle.CLOCK) return;
    if (Bangle.CLKINFO_FOCUS) return;
    if (lr == -1) qlTrace = "l"; // l=left,
    if (lr == 1) qlTrace = "r"; // r=right,
    if (ud == -1) qlTrace = "u"; // u=up,
    if (ud == 1) qlTrace = "d"; // d=down.
    if (lr == -1 && settings[qlTrace+"app"] && settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
    if (lr == 1 && settings[qlTrace+"app"] && settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
    if (ud == -1 && settings[qlTrace+"app"] && settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
    if (ud == 1 && settings[qlTrace+"app"] && settings[qlTrace+"app"].src){ if (settings[qlTrace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[qlTrace+"app"].src)) reset(qlTrace+"app"); else load(settings[qlTrace+"app"].src); }
  });
}
