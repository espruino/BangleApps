// This ALWAYS runs at boot
E.setFlags({pretokenise:1});
// All of this is just shim for older Bangles
if (!Bangle.loadWidgets) {
  Bangle.loadWidgets = function(){
    global.WIDGETPOS={tl:32,tr:g.getWidth()-32,bl:32,br:g.getWidth()-32};
    global.WIDGETS={};
    require("Storage").list().filter(a=>a[0]=='=').forEach(widget=>eval(require("Storage").read(widget)));
  };
  Bangle.drawWidgets = function(){
    for(var w of WIDGETS)w.draw()
  };
  Bangle.showLauncher = function(){
    var l = require("Storage").list().filter(a=>a[0]=='+').map(app=>{
      try { return require("Storage").readJSON(app); } catch (e) {}
    }).find(app=>app.type=="launch");
    if (l) load(l.src);
    else E.showMessage("Launcher\nnot found");
  };
  var _load = load;
  global.load = function(x) {
    if (!x) _load(x);
    else setTimeout(function(){
      // attempt to remove any currently-running code
      delete Bangle.buzz;
      delete Bangle.beep;
      Bangle.setLCDOffset&&Bangle.setLCDOffset(0);
      Bangle.setLCDMode("direct");
      g.clear();
      clearInterval();
      clearWatch();
      Bangle.removeAllListeners();
      NRF.removeAllListeners();
      Bluetooth.removeAllListeners();
      E.removeAllListeners();
      delete GB;
      delete WIDGETS;
      delete WIDGETPOS;
      setTimeout('eval(require("Storage").read("'+x+'"));',20);
    },20);
  }
}
