var s = require("Storage");
var apps = s.list(/\.info$/).map(app=>{var a=s.readJSON(app,1);return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || app.type=="clock" || !app.type));
apps.sort((a,b)=>{
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});
apps.forEach(app=>{
  if (app.icon)
    app.icon = s.read(app.icon); // should just be a link to a memory area
});
// FIXME: not needed after 2v11
var font = g.getFonts().includes("12x20") ? "12x20" : "6x8:2";
// FIXME: check not needed after 2v11
if (g.wrapString) {
  g.setFont(font);
  apps.forEach(app=>app.name = g.wrapString(app.name, g.getWidth()-64).join("\n"));
}

function drawApp(i, r) {
  var app = apps[i];
  if (!app) return;
  g.clearRect(r.x,r.y,r.x+r.w-1, r.y+r.h-1);
  g.setFont(font).setFontAlign(-1,0).drawString(app.name,64,r.y+32);
  if (app.icon) try {g.drawImage(app.icon,8,r.y+8);} catch(e){}
}

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

E.showScroller({
  h : 64, c : apps.length,
  draw : drawApp,
  select : i => {
    var app = apps[i];
    if (!app) return;
    if (!app.src || require("Storage").read(app.src)===undefined) {
      E.showMessage("App Source\nNot found");
      setTimeout(drawMenu, 2000);
    } else {
      E.showMessage("Loading...");
      load(app.src);
    }
  }
});
