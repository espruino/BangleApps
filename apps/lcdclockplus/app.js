Graphics.prototype.setFont7Seg = function() {
  return this.setFontCustom(atob("AAAAAAAAAAAACAQCAAAAAAIAd0BgMBdwAAAAAAAADuAAAB0RiMRcAAAAAiMRiLuAAAcAQCAQdwAADgiMRiIOAAAd0RiMRBwAAAAgEAgDuAAAd0RiMRdwAADgiMRiLuAAAABsAAAd0QiEQdwAADuCIRCIOAAAd0BgMBAAAAAOCIRCLuAAAd0RiMRAAAADuiEQiAAAAAd0BgMBBwAADuCAQCDuAAAdwAAAAAAAAAAAIBALuAAAdwQCAQdwAADuAIBAIAAAAd0AgEAcEAgEAdwAd0AgEAdwAADugMBgLuAAAd0QiEQcAAADgiEQiDuAAAd0AgEAAAAADgiMRiIOAAAAEAgEAdwAADuAIBALuAAAdwBAIBdwAADuAIBAIOAIBALuADuCAQCDuAAAcAQCAQdwAAAOiMRiLgAAAA=="), 32, atob("BwAAAAAAAAAAAAAAAAcCAAcHBwcHBwcHBwcEAAAAAAAABwcHBwcHBwcHBwcHCgcHBwcHBwcHBwoHBwc="), 9);
};


{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

require("Font7x11Numeric7Seg").add(Graphics);
const is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];

// Actually draw the watch face
let draw = function() {
  var x = R.x + R.w/2;
  var y = R.y + 48;
  g.reset().setColor(g.theme.bg).setBgColor(g.theme.fg);
  g.clearRect(R.x,bar1Y+2,R.x2,bar2Y-2);
  var date = new Date();
  var timeStr = require("locale").time(date, 1); // Hour and minute

  // Time
  if (is12Hour) {
    g.setFontAlign(-1, 0).setFont("7x11Numeric7Seg:4").drawString(timeStr, R.x, y+39);
    g.setFontAlign(1, 0).setFont("7Seg:2").drawString(require("locale").meridian(date).toUpperCase(), R.x2, y+30+(date.getHours() >= 12 ? 20 : 0));
  } else {
    g.setFontAlign(0, 0).setFont("7x11Numeric7Seg:4").drawString(timeStr, x, y+39);
  }

  // Day of week
  g.setFontAlign(-1, 0).setFont("7Seg:2").drawString(require("locale").dow(date, 1).toUpperCase(), R.x+2, y);

  // Date
  g.setFontAlign(-1, 0).setFont("7Seg:2").drawString(require("locale").month(new Date(), 2).toUpperCase(), x, y);
  g.setFontAlign(1, 0).setFont("7Seg:2").drawString(date.getDate(), R.x2 - 6, y);

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};

let clockInfoDraw = (itm, info, options) => {
  //let texty = options.y+41;
  g.reset().setFont("7Seg").setColor(g.theme.bg).setBgColor(g.theme.fg);
  if (options.focus) g.setBgColor("#FF0");
  g.clearRect({x:options.x,y:options.y,w:options.w,h:options.h,r:8});

  if (info.img) {
    g.drawImage(info.img, options.x+1,options.y+2);
  }
  var text = info.text.toString().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (g.setFont("7Seg:2").stringWidth(text)+24-2>options.w) g.setFont("7Seg");
  g.setFontAlign(0,-1).drawString(text, options.x+options.w/2+13, options.y+6);
};

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Graphics.prototype.setFont7Seg;
    // remove info menu
    clockInfoMenu.remove();
    delete clockInfoMenu;
    clockInfoMenu2.remove();
    delete clockInfoMenu2;
    clockInfoMenu3.remove();
    delete clockInfoMenu3;
    clockInfoMenu4.remove();
    delete clockInfoMenu4;
    // reset theme
    g.setTheme(oldTheme);
  }});
// Load widgets
Bangle.loadWidgets();
// Work out sizes
let R = Bangle.appRect;
R.x+=1;
R.y+=1;
R.x2-=1;
R.y2-=1;
R.w-=1;
R.h-=1;
let midX = R.x+R.w/2;
let bar1Y = R.y+30;
let bar2Y = R.y2-30;
// Clear the screen once, at startup
let oldTheme = g.theme;
g.setTheme({bg:"#000",fg:"#3ff",dark:true}).clear(1);
g.fillRect({x:R.x, y:R.y, w:R.w, h:R.h, r:8})
  .clearRect(R.x,bar1Y,R.w,bar1Y+1)
  .clearRect(midX,R.y,midX,bar1Y)
  .clearRect(R.x,bar2Y,R.w,bar2Y+1)
  .clearRect(midX,bar2Y,midX,R.y2+1);
draw();
Bangle.drawWidgets();
// Allocate and draw clockinfos
let clockInfoItems = require("clock_info").load();
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, { app:"lcdclock", x:R.x, y:R.y, w:midX-2, h:bar1Y-R.y-2, draw : clockInfoDraw});
let clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, {  app:"lcdclock", x:midX+1, y:R.y, w:midX-2, h:bar1Y-R.y-2, draw : clockInfoDraw});
let clockInfoMenu3 = require("clock_info").addInteractive(clockInfoItems, {  app:"lcdclock", x:R.x, y:bar2Y+2, w:midX-2, h:bar1Y-R.y-2, draw : clockInfoDraw});
let clockInfoMenu4 = require("clock_info").addInteractive(clockInfoItems, {  app:"lcdclock", x:midX+1, y:bar2Y+2, w:midX-2, h:bar1Y-R.y-2, draw : clockInfoDraw});
}
