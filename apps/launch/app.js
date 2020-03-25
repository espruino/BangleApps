var s = require("Storage");
var apps = s.list(/\.info$/).map(app=>s.readJSON(app,1)||{name:"DEAD: "+app.substr(1)}).filter(app=>app.type=="app" || app.type=="clock" || !app.type);
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
  if (require("Storage").read(apps[selected].src)===undefined) {
    E.showMessage("App Source\nNot found");
    setTimeout(drawMenu, 2000);
  } else {
    E.showMessage("Loading...");
    load(apps[selected].src);
  }
}, BTN2, {repeat:true,edge:"falling"});
