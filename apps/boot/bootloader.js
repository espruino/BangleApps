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
if (!clockApp) clockApp=`E.showMessage("No Clock Found");
setWatch(() => {
  Bangle.showLauncher();
}, BTN2, {repeat:false,edge:"falling"});)
`;
// check to see if our clock is wrong - if it is use GPS time
if ((new Date()).getFullYear()<2000) {
  E.showMessage("Searching for\nGPS time");
  Bangle.on("GPS",function cb(g) {
    Bangle.setGPSPower(0);
    Bangle.removeListener("GPS",cb);
    if (!g.time || (g.time.getFullYear()<2000) ||
       (g.time.getFullYear()>2200)) {
      // GPS receiver's time not set - just boot clock anyway
      eval(clockApp);
      delete clockApp;
      return;
    }
    // We have a GPS time. Set time and reboot (to load alarms properly)
    setTime(g.time.getTime()/1000);
    load();
  });
  Bangle.setGPSPower(1);
} else {
  eval(clockApp);
  delete clockApp;
}
