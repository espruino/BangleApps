var s = require("Storage");
var apps = s.list(/\.info$/).map(app=>{var a=s.readJSON(app,1);return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || app.type=="clock" || !app.type));
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
  g.reset().setFont("6x8",2).setFontAlign(-1,0);
  var w = g.getWidth();
  var h = g.getHeight();
  var m = w/2;
  var n = Math.floor((h-48)/64);
  if (selected>=n+menuScroll) menuScroll = 1+selected-n;
  if (selected<menuScroll) menuScroll = selected;
  // arrows
  g.setColor(menuScroll ? g.theme.fg : g.theme.bg);
  g.fillPoly([m,6,m-14,20,m+14,20]);
  g.setColor((apps.length>n+menuScroll) ? g.theme.fg : g.theme.bg);
  g.fillPoly([m,h-7,m-14,h-21,m+14,h-21]);
  // draw
  g.setColor(g.theme.fg);
  for (var i=0;i<n;i++) {
    var app = apps[i+menuScroll];
    if (!app) break;
    var y = 24+i*64;
    if (i+menuScroll==selected) {
      g.setColor(g.theme.bgH).fillRect(0,y,w-1,y+63);
      g.setColor(g.theme.fgH).drawRect(0,y,w-1,y+63);
    } else {
      g.clearRect(0, y, w-1, y+63);
      g.setColor(g.theme.fg);
    }
    g.drawString(app.name,64,y+32);
    var icon=undefined;
    if (app.icon) icon = s.read(app.icon);
    if (icon) try {g.drawImage(icon,8,y+8);} catch(e){}
  }
}
g.clear();
drawMenu();
Bangle.setUI("updown",dir=>{
  if (dir) {
    selected += dir;
    if (selected<0) selected = apps.length-1;
    if (selected>=apps.length) selected = 0;
    drawMenu();
  } else {
    if (!apps[selected].src) return;
    if (require("Storage").read(apps[selected].src)===undefined) {
      E.showMessage("App Source\nNot found");
      setTimeout(drawMenu, 2000);
    } else {
      E.showMessage("Loading...");
      load(apps[selected].src);
    }
  }
});
Bangle.loadWidgets();
Bangle.drawWidgets();
// 10s of inactivity goes back to clock
if (Bangle.setLocked) Bangle.setLocked(false); // unlock initially
var lockTimeout;
Bangle.on('lock', locked => {
  if (lockTimeout) clearTimeout(lockTimeout);
  lockTimeout = undefined;
  if (locked)
    lockTimeout = setTimeout(_=>load(), 10000);
});
