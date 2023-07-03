{
  const storage = require("Storage");
  let settings = storage.readJSON("quicklaunch.json", true) || {};

  let reset = function(name){
    if (!settings[name]) settings[name] = {"name":"(none)"};
    if (!storage.read(settings[name].src)) settings[name] = {"name":"(none)"};
    storage.write("quicklaunch.json", settings);
  };

  let leaveTrace = function(trace) {
    if (settings[trace+"app"].name != "") {
      settings.trace = trace;
      storage.writeJSON("quicklaunch.json", settings);
    } else { trace = trace.substring(0, trace.length-1); }
    return trace;
  };

  let launchApp = function(trace) {
    if (settings[trace+"app"]) {
      if (settings[trace+"app"].src){
        if (settings[trace+"app"].name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings[trace+"app"].src)) reset(trace+"app"); else load(settings[trace+"app"].src);
      }
    }
  };

  let trace = (settings[settings.trace+"app"].src=="quicklaunch.app.js") ? settings.trace : settings.trace.substring(0, settings.trace.length-1); // If the stored trace leads beyond extension screens, walk back to the last extension screen. Compatibility with "Fastload Utils" App History feature.

  let touchHandler = (_,e) => {
    if (e.type == 2) return;
    let R = Bangle.appRect;
    if (e.x < R.x || e.x > R.x2 || e.y < R.y || e.y > R.y2 ) return;
    trace = leaveTrace(trace+"t"); // t=tap.
    launchApp(trace);
  };

  let swipeHandler = (lr,ud) => {
    if (lr == -1) trace = leaveTrace(trace+"l"); // l=left, 
    if (lr == 1) trace = leaveTrace(trace+"r"); // r=right,
    if (ud == -1) trace = leaveTrace(trace+"u"); // u=up,
    if (ud == 1) trace = leaveTrace(trace+"d"); // d=down.
    launchApp(trace);
  };

  let onLongTouchDoPause = (e)=>{
    if (e.b == 1 && timeoutToClock) {clearTimeout(timeoutToClock); timeoutToClock = false;}
    if (e.b == 0 && !timeoutToClock) updateTimeoutToClock();
  };

  Bangle.setUI({
    mode: "custom",
    touch: touchHandler,
    swipe : swipeHandler,
    drag : onLongTouchDoPause,
    remove: ()=>{if (timeoutToClock) clearTimeout(timeoutToClock);} // Compatibility with Fastload Utils.
  });

  g.clearRect(Bangle.appRect);
  "Bangle.loadWidgets()"; // Hack: Fool Fastload Utils that we call Bangle.loadWidgets(). This way we get the fastest possibe loading in whichever environment we find ourselves.

  // taken from Icon Launcher with some alterations
  let timeoutToClock;
  const updateTimeoutToClock = function(){
    let time = 1500; // milliseconds
    if (timeoutToClock) clearTimeout(timeoutToClock);
    timeoutToClock = setTimeout(load,time);
  };
  updateTimeoutToClock();

  let R = Bangle.appRect; 

  // Draw app hints
  g.setFont("Vector", 11)
    .setFontAlign(0,1,3).drawString(settings[trace+"lapp"].name, R.x2, R.y+R.h/2)
    .setFontAlign(0,1,1).drawString(settings[trace+"rapp"].name, R.x, R.y+R.h/2)
    .setFontAlign(0,1,0).drawString(settings[trace+"uapp"].name, R.x+R.w/2, R.y2)
    .setFontAlign(0,-1,0).drawString(settings[trace+"dapp"].name, R.x+R.w/2, R.y)
    .setFontAlign(0,0,0).drawString(settings[trace+"tapp"].name, R.x+R.w/2, R.y+R.h/2);
}
