// This runs after a 'fresh' boot
var clockApp=(require("Storage").readJSON("setting.json",1)||{}).clock;
if (clockApp) clockApp = require("Storage").read(clockApp);
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
  if (clockApp)
    clockApp = require("Storage").read(clockApp.src);
}
if (!clockApp) clockApp=`E.showMessage("No Clock Found");setWatch(()=>{Bangle.showLauncher();}, BTN2, {repeat:false,edge:"falling"});`;
eval(clockApp);
delete clockApp;
