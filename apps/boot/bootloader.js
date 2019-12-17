E.setFlags({pretokenise:1});
var startapp;
try {
  startapp = require('Storage').readJSON('+start');
} catch (e) {}
if (startapp) {
  eval(require("Storage").read(startapp.src));
} else {
  setWatch(function displayMenu() {
    Bangle.setLCDOffset(0); // remove notifications
    Bangle.setLCDMode("direct");
    g.clear();
    // attempt to remove any currently-running code
    clearInterval();
    clearWatch();
    Bangle.removeAllListeners();
    NRF.removeAllListeners();
    Bluetooth.removeAllListeners();
    E.removeAllListeners();
    delete GB;
    delete WIDGETS;
    delete WIDGETPOS;
    delete drawWidgets;
    var s = require("Storage");
    var apps = s.list().filter(a=>a[0]=='+').map(app=>{
      try { return s.readJSON(app); }
      catch (e) { return {name:"DEAD: "+app.substr(1)} }
    }).filter(app=>app.type=="app" || app.type=="clock" || !app.type);
    apps.sort((a,b)=>{
      var n=(0|a.sortorder)-(0|b.sortorder);
      if (n) return n; // do sortorder first
      if (a.name<b.name) return -1;
      if (a.name>b.name) return 1;
      return 0;
    });
    var selected = 0;
    var menuScroll = 0;
    var menuShowing = false;

    function drawMenu() {
      g.setFont("6x8",2);
      g.setFontAlign(-1,0);
      var n = 3;
      if (selected>=n+menuScroll) menuScroll = 1+selected-n;
      if (selected<menuScroll) menuScroll = selected;
      if (menuScroll) g.fillPoly([120,0,100,20,140,20]);
      else g.clearRect(100,0,140,20);
      if (apps.length>n+menuScroll) g.fillPoly([120,239,100,219,140,219]);
      else g.clearRect(100,219,140,239);
      for (var i=0;i<n;i++) {
        var app = apps[i+menuScroll];
        if (!app) break;
        var y = 24+i*64;
        if (i+menuScroll==selected) {
          g.setColor(0.3,0.3,0.3);
          g.fillRect(0,y,239,y+63);
          g.setColor(1,1,1);
          g.drawRect(0,y,239,y+63);
        } else
          g.clearRect(0,y,239,y+63);
        g.drawString(app.name,64,y+32);
        var icon=undefined;
        if (app.icon) icon = s.read(app.icon);
        if (icon) try {g.drawImage(icon,8,y+8);} catch(e){}
      }
    }
    drawMenu();
    setWatch(function() {
      if (selected>0) {
        selected--;
        drawMenu();
      }
    }, BTN1, {repeat:true});
    setWatch(function() {
      if (selected+1<apps.length) {
        selected++;
        drawMenu();
      }
    }, BTN3, {repeat:true});
    setWatch(function() { // run
      if (!apps[selected].src) return;
      clearWatch();
      g.clear(1);
      g.setFont("6x8",2);
      g.setFontAlign(0,0);
      g.drawString("Loading...",120,120);
      // if clock, just set the default setting and restart
      if (apps[selected].type=="clock") {
        try {
          var settings = require("Storage").readJSON('@setting');
          settings.clock = apps[selected].src;
          require("Storage").write('@setting',settings);
        } catch (e) { }
        load();
      } else {
        // load like this so we ensure we've cleared out our RAM
        setTimeout(process.memory,10); // force GC
        setTimeout('eval(require("Storage").read("'+apps[selected].src+'"));',20);
      }
    }, BTN2, {repeat:true,edge:"falling"});
  }, BTN2, {repeat:false,edge:"falling"}); // menu on middle button

  var WIDGETPOS={tl:32,tr:g.getWidth()-32,bl:32,br:g.getWidth()-32};
  var WIDGETS={};
  function drawWidgets() { for (var w of WIDGETS) w.draw(); }
  var settings;
  try {
    settings = require("Storage").readJSON('@setting');
  } catch (e) {
    settings = {}
  }
  // load widgets
  require("Storage").list().filter(a=>a[0]=='=').forEach(widget=>eval(require("Storage").read(widget)));
  setTimeout(drawWidgets,100);
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
