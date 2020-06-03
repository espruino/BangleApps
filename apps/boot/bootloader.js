// This runs after a 'fresh' boot
var settings=require("Storage").readJSON('setting.json',1)||{};
// load clock if specified
var clockApp = settings.clock;
if (clockApp) clockApp = require("Storage").read(clockApp)
if (!clockApp) {
  var clockApps = require("Storage").list(/\.info$/).map(app=>require("Storage").readJSON(app,1)||{}).filter(app=>app.type=="clock").sort((a, b) => a.sortorder - b.sortorder);
  if (clockApps && clockApps.length > 0)
    clockApp = require("Storage").read(clockApps[0].src);
  delete clockApps;
}
if (!clockApp) clockApp=`E.showMessage("No Clock Found");
setWatch(() => {
  Bangle.showLauncher();
}, BTN2, {repeat:false,edge:"falling"});)
`;
delete settings;
// check to see if our clock is wrong - if it is use GPS time
if ((new Date()).getFullYear()<2000) {
  E.showMessage("Searching for\nGPS time");
  Bangle.on('GPS',function cb(g) {
    Bangle.setGPSPower(0);
    Bangle.removeListener("GPS",cb);
    if (!g.time || (g.time.getFullYear()<2000) ||
       (g.time.getFullYear()>2200)) {
      // GPS receiver's time not set - just boot clock anyway
      eval(clockApp);delete clockApp;
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
