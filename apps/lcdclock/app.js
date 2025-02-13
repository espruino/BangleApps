Graphics.prototype.setFont7Seg = function() {
  return this.setFontCustom(atob("AAAAAAAAAAAACAQCAAAAAAIAd0BgMBdwAAAAAAAADuAAAB0RiMRcAAAAAiMRiLuAAAcAQCAQdwAADgiMRiIOAAAd0RiMRBwAAAAgEAgDuAAAd0RiMRdwAADgiMRiLuAAAABsAAAd0QiEQdwAADuCIRCIOAAAd0BgMBAAAAAOCIRCLuAAAd0RiMRAAAADuiEQiAAAAAd0BgMBBwAADuCAQCDuAAAdwAAAAAAAAAAAIBALuAAAdwQCAQdwAADuAIBAIAAAAd0AgEAcEAgEAdwAd0AgEAdwAADugMBgLuAAAd0QiEQcAAADgiEQiDuAAAd0AgEAAAAADgiMRiIOAAAAEAgEAdwAADuAIBALuAAAdwBAIBdwAADuAIBAIOAIBALuADuCAQCDuAAAcAQCAQdwAAAOiMRiLgAAAA=="), 32, atob("BwAAAAAAAAAAAAAAAAcCAAcHBwcHBwcHBwcEAAAAAAAABwcHBwcHBwcHBwcHCgcHBwcHBwcHBwoHBwc="), 9);
}


{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

// Actually draw the watch face
let draw = function() {
  var x = R.x + R.w/2;
  var y = R.y + R.h/2;
  g.reset().setColor(g.theme.bg).setBgColor(g.theme.fg);
  g.clearRect(R.x,barY+2,R.x2,R.y2-8);
  var date = new Date();
  var timeStr = require("locale").time(date, 1); // Hour and minute
  g.setFontAlign(0, 0).setFont("7Seg:5").drawString(timeStr, x, y+39);
  // Show date and day of week
  g.setFontAlign(0, 0).setFont("7Seg:2");
  g.setFontAlign(-1, 0).drawString(require("locale").meridian(date).toUpperCase(), R.x+6, y);
  g.setFontAlign(0, 0).drawString(require("locale").dow(date, 1).toUpperCase(), x, y);
  g.setFontAlign(1, 0).drawString(date.getDate(), R.x2 - 6, y);

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

  if (info.img) g.drawImage(info.img, options.x+2, options.y+2);
  var title = clockInfoItems[options.menuA].name;
  var text = info.text.toString().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (title!="Bangle") g.setFontAlign(1,0).drawString(title.toUpperCase(), options.x+options.w-2, options.y+14);
  if (g.setFont("7Seg:2").stringWidth(text)+8>options.w) g.setFont("7Seg");
  g.setFontAlign(0,0).drawString(text, options.x+options.w/2, options.y+40);
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
R.w-=2;
R.h-=2;
let midX = R.x+R.w/2;
let barY = 80;
// Clear the screen once, at startup
let oldTheme = g.theme;
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear(1);
g.fillRect({x:R.x, y:R.y, w:R.w, h:R.h, r:8}).clearRect(R.x,barY,R.w,barY+1).clearRect(midX,R.y,midX+1,barY);
draw();
Bangle.drawWidgets();
// Allocate and draw clockinfos
let clockInfoItems = require("clock_info").load();
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, { app:"lcdclock", x:R.x, y:R.y, w:midX-2, h:barY-R.y-2, draw : clockInfoDraw});
let clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, {  app:"lcdclock", x:midX+2, y:R.y, w:midX-3, h:barY-R.y-2, draw : clockInfoDraw});
}
