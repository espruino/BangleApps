// This runs after a 'fresh' boot
var settings=require("Storage").readJSON('setting.json',1)||{};
if (!settings.welcomed && require("Storage").read("welcome.js")!==undefined) {
  setTimeout(()=>load("welcome.js"));
} else {
  // load clock if specified
  var clockApp = settings.clock;
  if (clockApp) clockApp = require("Storage").read(clockApp)
  if (!clockApp) {
    var clockApps = require("Storage").list(/\.info$/).map(app=>require("Storage").readJSON(app,1)||{}).filter(app=>app.type=="clock").sort((a, b) => a.sortorder - b.sortorder);
    if (clockApps && clockApps.length > 0)
      clockApp = require("Storage").read(clockApps[0].src);
    delete clockApps;
  }
  if (clockApp) eval(clockApp);
  else E.showMessage("No Clock Found");
  delete clockApp;
}
delete settings;
