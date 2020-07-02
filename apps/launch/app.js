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
  g.setFont("6x8",2);
  g.setFontAlign(-1,0);
  var n = 3;
  if (selected>=n+menuScroll) menuScroll = 1+selected-n;
  if (selected<menuScroll) menuScroll = selected;
  // arrows
  g.setColor(menuScroll ? -1 : 0);
  g.fillPoly([120,6,106,20,134,20]);
  g.setColor((apps.length>n+menuScroll) ? -1 : 0);
  g.fillPoly([120,233,106,219,134,219]);
  // draw
  g.setColor(-1);
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
  selected--;
  if (selected<0) selected = apps.length-1;
  drawMenu();
}, BTN1, {repeat:true});
setWatch(function() {
  selected++;
  if (selected>=apps.length) selected = 0;
  drawMenu();
}, BTN3, {repeat:true});
setWatch(function() { // run
  if (!apps[selected].src) return;
  if (require("Storage").read(apps[selected].src)===undefined) {
    E.showMessage("App Source\nNot found");
    setTimeout(drawMenu, 2000);
  } else {
    E.showMessage("Loading...");
    load(apps[selected].src);
  }
}, BTN2, {repeat:true,edge:"falling"});
Bangle.loadWidgets();
Bangle.drawWidgets();
