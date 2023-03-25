{
  const storage = require("Storage");
  let settings = storage.readJSON("quicklaunch.json", true) || {};

  let reset = function(name){
    if (!settings[name]) settings[name] = {"name":"(none)"};
    if (!storage.read(settings[name].src)) settings[name] = {"name":"(none)"};
    storage.write("quicklaunch.json", settings);
  };

  let leaveTrace = function(trace) {
    settings.trace = trace;
    storage.writeJSON("quicklaunch.json", settings);
    return trace;
  };

  let launchApp = function(trace) {
    if (settings[trace+"app"].src){ 
      if (settings[trace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[trace+"app"].src)) reset(trace+"app"); else load(settings[trace+"app"].src); 
    }
  }

  let trace;

  Bangle.on("touch", (_,e) => {
    if (!Bangle.CLOCK) return;
    if (Bangle.CLKINFO_FOCUS) return;
    let R = Bangle.appRect;
    if (e.x < R.x || e.x > R.x2 || e.y < R.y || e.y > R.y2 ) return;
    trace = leaveTrace("t"); // t=tap
    launchApp(trace);
  });

  Bangle.on("swipe", (lr,ud) => {
    if (!Bangle.CLOCK) return;
    if (Bangle.CLKINFO_FOCUS) return;
    if (lr == -1) trace = leaveTrace("l"); // l=left,
    if (lr == 1) trace = leaveTrace("r"); // r=right,
    if (ud == -1) trace = leaveTrace("u"); // u=up,
    if (ud == 1) trace = leaveTrace("d"); // d=down.
    launchApp(trace);
  });
}
