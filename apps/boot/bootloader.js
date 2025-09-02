// This runs after a 'fresh' boot
var s = require("Storage").readJSON("setting.json",1)||{};
/* If were being called from JS code in order to load the clock quickly (eg from a launcher)
and the clock in question doesn't have widgets, force a normal 'load' as this will then
reset everything and remove the widgets. */
if (global.__FILE__ && !s.clockHasWidgets) {load();throw "Clock has no widgets, can't fast load";}
// Otherwise continue to try and load the clock
var _clkApp = require("Storage").read(s.clock);
if (!_clkApp) {
  _clkApp = require("Storage").list(/\.info$/)
    .map(file => {
      const app = require("Storage").readJSON(file,1);
      if (app && app.type == "clock") {
        return app;
      }
    })
    .filter(x=>x)
    .sort((a, b) => a.sortorder - b.sortorder)[0];
  if (_clkApp){
    s.clock = _clkApp.src;
    _clkApp = require("Storage").read(_clkApp.src);
    s.clockHasWidgets = _clkApp.includes("Bangle.loadWidgets");
    require("Storage").writeJSON("setting.json", s);
  }
}
if (s.clock) __FILE__=s.clock;
delete s;
if (!_clkApp) _clkApp=`E.showMessage("No Clock Found");setWatch(()=>{Bangle.showLauncher();}, global.BTN2||BTN, {repeat:false,edge:"falling"});`;
eval(_clkApp);
delete _clkApp;