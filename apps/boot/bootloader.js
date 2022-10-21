// This runs after a 'fresh' boot
var s = require("Storage").readJSON("setting.json",1)||{};
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
    require("Storage").writeJSON("setting.json", s);
  }
}
delete s;
if (!_clkApp) _clkApp=`E.showMessage("No Clock Found");setWatch(()=>{Bangle.showLauncher();}, global.BTN2||BTN, {repeat:false,edge:"falling"});`;
eval(_clkApp);
delete _clkApp;
