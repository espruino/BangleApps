E.setTimeZone(1);
E.setFlags({pretokenise:1});
var startapp;
try {
  startapp = s.readJSON('+start');
} catch (e) {}
if (startapp) {
  eval(require("Storage").read(startapp.src));
} else {
  setWatch(function() {
    Bangle.setLCDMode("direct");
    g.clear();
    clearInterval();
    clearWatch();
    Bangle.removeAllListeners();

    var s = require("Storage");

    apps = s.list().filter(a=>a[0]=='+').map(app=>{
      try { return s.readJSON(app); }
      catch (e) { return {name:"DEAD: "+app.substr(1)} }
    }).filter(app=>app.type=="app" || app.type=="clock" || !app.type);
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
      g.clear();
      g.setFont("6x8",2);
      g.setFontAlign(0,0);
      g.drawString("Loading...",120,120);
      if (apps[selected].name=="Clock") load();
      else { // load like this so we ensure we've cleared out our RAM
        var cmd = 'eval(require("Storage").read("'+apps[selected].src+'"));';
        setTimeout(cmd,20);
      }
    }, BTN2, {repeat:true});
  }, BTN2, {repeat:false}); // menu on middle button
  var WIDGETPOS={tl:32,tr:g.getWidth()-32,bl:32,br:g.getWidth()-32};
  var WIDGETS={};
  function drawWidgets() {
    Object.keys(WIDGETS).forEach(k=>WIDGETS[k].draw());
  }

  var clockApp = require("Storage").list().filter(a=>a[0]=='+').map(app=>{
    try { return require("Storage").readJSON(app); }
    catch (e) {}
  }).find(app=>app.type=="clock");
  if (clockApp) eval(require("Storage").read(clockApp.src));
  else E.showMessage("No Clock Found");
  delete clockApp;
  require("Storage").list().filter(a=>a[0]=='=').forEach(widget=>eval(require("Storage").read(widget)));
  setTimeout(drawWidgets,100);
}
