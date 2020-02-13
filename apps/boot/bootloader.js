// This runs after a 'fresh' boot
var settings={};
try { settings = require("Storage").readJSON('@setting'); } catch (e) {}
if (!settings.welcomed && require("Storage").read("-welcome")!==undefined) {
  setTimeout(()=>load("-welcome"));
} else {
  // load clock if specified
  var clockApp = settings.clock;
  if (clockApp) clockApp = require("Storage").read(clockApp)
  if (!clockApp) {
    var clockApps = require("Storage").list().filter(a=>a[0]=='+').map(app=>{
      try { return require("Storage").readJSON(app); }
      catch (e) {}
    }).filter(app=>app.type=="clock").sort((a, b) => a.sortorder - b.sortorder);
    if (clockApps && clockApps.length > 0)
      clockApp = require("Storage").read(clockApps[0].src);
    delete clockApps;
  }
  if (clockApp) eval(clockApp);
  else E.showMessage("No Clock Found");
  delete clockApp;
}
delete settings;
