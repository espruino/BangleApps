// This runs after a 'fresh' boot
var s = require("Storage").readJSON("setting.json",1)||{};
var clockApp = require("Storage").read(s.clock);
if (!clockApp) {
  clockApp = require("Storage").list(/\.info$/)
    .map(file => {
      const app = require("Storage").readJSON(file,1);
      if (app && app.type == "clock") {
        return app;
      }
    })
    .filter(x=>x)
    .sort((a, b) => a.sortorder - b.sortorder)[0];
  if (clockApp){
    clockApp = require("Storage").read(clockApp.src);
    s.clock = clockApp.src;
    require("Storage").writeJSON("setting.json", s);
  }
}
if (!clockApp) clockApp=`E.showMessage("No Clock Found");setWatch(()=>{Bangle.showLauncher();}, global.BTN2||BTN, {repeat:false,edge:"falling"});`;
eval(clockApp);
delete s;
delete clockApp;
