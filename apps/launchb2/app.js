var s = require("Storage");
var apps = s.list(/\.info$/).map(app=>{var a=s.readJSON(app,1);return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || app.type=="clock" || !app.type));
apps.sort((a,b)=>{
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});
var APPH = 64;
var menuScroll = 0;
var menuShowing = false;
var w = g.getWidth();
var h = g.getHeight();
var n = Math.ceil((h-24)/APPH);
var menuScrollMax = APPH*apps.length - (h-24);

apps.forEach(app=>{
  if (app.icon)
    app.icon = s.read(app.icon); // should just be a link to a memory area
});

function drawApp(i) {
  var y = 24+i*APPH-menuScroll;
  var app = apps[i];
  if (!app || y<-APPH || y>=g.getHeight()) return;
  g.setFont("6x8",2).setFontAlign(-1,0).drawString(app.name,64,y+32);
  if (app.icon) try {g.drawImage(app.icon,8,y+8);} catch(e){}
}

function drawMenu() {
  g.reset().clearRect(0,24,w-1,h-1);
  g.setClipRect(0,24,g.getWidth()-1,g.getHeight()-1);
  for (var i=0;i<n;i++) drawApp(i);
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
}
g.clear();
drawMenu();
g.flip(); // force an update now to make this snappier
Bangle.on('drag',e=>{
  var dy = e.dy;
  if (menuScroll - dy < 0)
    dy = menuScroll;
  if (menuScroll - dy > menuScrollMax)
    dy = menuScroll - menuScrollMax;
  if (!dy) return;
  g.reset().setClipRect(0,24,g.getWidth()-1,g.getHeight()-1);
  g.scroll(0,dy);
  menuScroll -= dy;
  if (e.dy < 0) {
    drawApp(Math.floor((menuScroll+24+g.getHeight())/APPH)-1);
    if (e.dy <= -APPH) drawApp(Math.floor((menuScroll+24+g.getHeight())/APPH)-2);
  } else {
    drawApp(Math.floor((menuScroll+24)/APPH));
    if (e.dy >= APPH) drawApp(Math.floor((menuScroll+24)/APPH)+1);
  }
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
});
Bangle.on("touch",(_,e)=>{
  if (e.y<20) return;
  var i = Math.floor((e.y+menuScroll-24) / APPH);
  var app = apps[i];
  if (!app) return;
  if (!app.src || require("Storage").read(app.src)===undefined) {
    E.showMessage("App Source\nNot found");
    setTimeout(drawMenu, 2000);
  } else {
    E.showMessage("Loading...");
    load(app.src);
  }
});
Bangle.loadWidgets();
Bangle.drawWidgets();
