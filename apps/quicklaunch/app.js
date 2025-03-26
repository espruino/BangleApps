{
  const R = Bangle.appRect;
  g.clearRect(R); // clear immediately to increase perceived snappiness.

  const storage = require("Storage");
  let settings = storage.readJSON("quicklaunch.json", true) || {};
  let trace = (settings[settings.trace+"app"].src=="quicklaunch.app.js") ? settings.trace : settings.trace.substring(0, settings.trace.length-1); // If the stored trace leads beyond extension screens, walk back to the last extension screen. Compatibility with "Fastload Utils" App History feature.

  const draw = () => {
    // Draw app hints
    g.reset().clearRect(R).setFont("Vector", 11)
      .setFontAlign(0,1,3).drawString(settings[trace+"lapp"].name, R.x2, R.y+R.h/2)
      .setFontAlign(0,1,1).drawString(settings[trace+"rapp"].name, R.x, R.y+R.h/2)
      .setFontAlign(0,1,0).drawString(settings[trace+"uapp"].name, R.x+R.w/2, R.y2)
      .setFontAlign(0,-1,0).drawString(settings[trace+"dapp"].name, R.x+R.w/2, R.y)
      .setFontAlign(0,0,0).drawString(settings[trace+"tapp"].name, R.x+R.w/2, R.y+R.h/2);
  };
  draw(); // draw asap to increase perceived snappiness.

  let leaveTrace = function(trace) {
    if (settings[trace+"app"].name != "") {
      settings.trace = trace;
    } else { trace = trace.substring(0, trace.length-1); }
    return trace;
  };

  let launchApp = function(trace) {
    if (settings[trace+"app"] && settings[trace+"app"].src) {
      if (settings[trace+"app"].name == "Extension") draw();
        else if (settings[trace+"app"].name == "Show Launcher") Bangle.showLauncher();
          else if (!storage.read(settings[trace+"app"].src)) {
            E.showMessage(settings[trace+"app"].src+"\n"+/*LANG*/"was not found"+".", "Quick Launch");
            settings[trace+"app"] = {"name":"(none)"}; // reset entry.
          } else load(settings[trace+"app"].src);
    }
  };

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

  let saveAndClear = ()=> {
    storage.writeJSON("quicklaunch.json", settings);
    E.removeListener("kill", saveAndClear);
    if (timeoutToClock) clearTimeout(timeoutToClock); // Compatibility with Fastload Utils.
  }

  Bangle.setUI({
    mode: "custom",
    touch: touchHandler,
    swipe : swipeHandler,
    drag : onLongTouchDoPause,
    remove: saveAndClear
  });

  E.on("kill", saveAndClear)

  "Bangle.loadWidgets()"; // Hack: Fool Fastload Utils that we call Bangle.loadWidgets(). This way we get the fastest possibe loading in whichever environment we find ourselves.

  // taken from Icon Launcher with some alterations
  let timeoutToClock;
  const updateTimeoutToClock = function(){
    let time = 1500; // milliseconds
    if (timeoutToClock) clearTimeout(timeoutToClock);
    timeoutToClock = setTimeout(load,time);
  };
  updateTimeoutToClock();

}
