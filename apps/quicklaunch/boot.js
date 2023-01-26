{
  let settings = require("Storage").readJSON("quicklaunch.json", true) || {};
  const storage = require("Storage");

  let reset = function(name){
    if (!settings[name]) settings[name] = {"name":"(none)"};
    if (!require("Storage").read(settings[name].src)) settings[name] = {"name":"(none)"};
    storage.write("quicklaunch.json", settings);
  };

  Bangle.on("touch", (_,e) => {
    if (!Bangle.CLOCK) return;
    if (Bangle.CLKINFO_FOCUS) return;
    let R = Bangle.appRect;
    if (e.x < R.x || e.x > R.x2 || e.y < R.y || e.y > R.y2 ) return;
    if (settings.tapapp.src){ if (!storage.read(settings.tapapp.src)) reset("tapapp"); else load(settings.tapapp.src); }
  });

  Bangle.on("swipe", (lr,ud) => {
    if (!Bangle.CLOCK) return;
    if (Bangle.CLKINFO_FOCUS) return;

    if (lr == -1 && settings.leftapp && settings.leftapp.src){ if (settings.leftapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.leftapp.src)) reset("leftapp"); else load(settings.leftapp.src); }
    if (lr == 1 && settings.rightapp && settings.rightapp.src){ if (settings.rightapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.rightapp.src)) reset("rightapp"); else load(settings.rightapp.src); }
    if (ud == -1 && settings.upapp && settings.upapp.src){ if (settings.upapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.upapp.src)) reset("upapp"); else load(settings.upapp.src); }
    if (ud == 1 && settings.downapp && settings.downapp.src){ if (settings.downapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.downapp.src)) reset("downapp"); else load(settings.downapp.src); }
  });
}
