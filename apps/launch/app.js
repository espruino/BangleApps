var s = require("Storage");
var scaleval = 1;
var vectorval = 20;
var font = g.getFonts().includes("12x20") ? "12x20" : "6x8:2";
let settings = Object.assign({ showClocks: true }, s.readJSON("launch.json", true) || {});

if ("vectorsize" in settings) {
    vectorval = parseInt(settings.vectorsize);
}
if ("font" in settings){
    if(settings.font == "Vector"){
        scaleval = vectorval/20;
        font = "Vector"+(vectorval).toString();
    }
    else{
        font = settings.font;
        scaleval = (font.split("x")[1])/20;
    }
}
var apps = s.list(/\.info$/).map(app=>{var a=s.readJSON(app,1);return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || (app.type=="clock" && settings.showClocks) || !app.type));
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
// FIXME: check not needed after 2v11
if (g.wrapString) {
  g.setFont(font);
  apps.forEach(app=>app.name = g.wrapString(app.name, g.getWidth()-64).join("\n"));
}

function drawApp(i, r) {
  var app = apps[i];
  if (!app) return;
  g.clearRect((r.x),(r.y),(r.x+r.w-1), (r.y+r.h-1));
  g.setFont(font).setFontAlign(-1,0).drawString(app.name,64*scaleval,r.y+(32*scaleval));
  if (app.icon) try {g.drawImage(app.icon,8*scaleval, r.y+(8*scaleval), {scale: scaleval});} catch(e){}
}

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

E.showScroller({
  h : 64*scaleval, c : apps.length,
  draw : drawApp,
  select : i => {
    var app = apps[i];
    if (!app) return;
    if (!app.src || require("Storage").read(app.src)===undefined) {
      E.showMessage(/*LANG*/"App Source\nNot found");
      setTimeout(drawMenu, 2000);
    } else {
      E.showMessage(/*LANG*/"Loading...");
      load(app.src);
    }
  }
});

// on bangle.js 2, the screen is used for navigating, so the single button goes back
// on bangle.js 1, the buttons are used for navigating
if (process.env.HWVERSION==2) {
  setWatch(_=>load(), BTN1, {edge:"falling"});
}

// 10s of inactivity goes back to clock
Bangle.setLocked(false); // unlock initially
var lockTimeout;
Bangle.on("lock", locked => {
  if (lockTimeout) clearTimeout(lockTimeout);
  lockTimeout = undefined;
  if (locked)
    lockTimeout = setTimeout(_=>load(), 10000);
});
