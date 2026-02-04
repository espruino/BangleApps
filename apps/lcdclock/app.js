Graphics.prototype.setFont7Seg = function() {
  return this.setFontCustom(atob("AAAAAAAAACAQAAAAIAd0BgLuAAAAAAdwAB0RiLgAAAiMRdwAcAQCDuADgiMRBwAd0RiIOAAAgEAdwAd0RiLuADgiMRdwAABsADuiEQdwAdwRCIOADugMBAAABwRCLuADuiMRAAAd0QiAAADugMBBwAdwQCDuADuAAAAAAAABALuADuCAQdwAdwBAIAADugEAcEAdwAd0AgDuADugMBdwAd0QiDgADgiEQdwAd0AgAAADgiMRBwAAEAgDuADuAIBdwAdwBALuADuAIBBwBdwAdwQCDuADgCAQdwAB0RiLgAA="), 32, atob("BQAAAAAAAAAAAAAAAAUCAAUFBQUFBQUFBQUDAAAAAAAABQUFBQUFBQUFBQUFBwUFBQUFBQUFBQcFBQU="), 9);
};
/* font created with:
require("sevenseg_font_tools").createFont({
  img : `
 aa j
f  b i
fx b i
fx b i
 gg
ex c i
ex c i
e  c i
odd h`,
  width : 5, // width +1 for empty column
  colonWidth : 3, // width of colon
  doubleWidth : 7, // width for double-size (eg 'W' and 'M')
  height : 9,
  export : "alphanum"
});
*/
Graphics.prototype.setFont7SegBig = function() {
  return this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAHAAAAAAAAfAAAAAAAA+AAAAAAAB8AAAAAAAD4AAAAAAAHwAAAAAAAPgAAAAAAAfAAAAAAAA+AAAAAAAB8AAAAAAAD4AAAAAAAHwAAAAAAAPgAAAAAAAfAAAAAAAA+AAAAAAAA4AAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///j///8f//+D///yf//4D///Of//gD//8+f/+AD//z+AAAAAAAP+AAAAAAA/8AAAAAAB/4AAAAAAD/wAAAAAAH/gAAAAAAP/AAAAAAAf+AAAAAAA/8AAAAAAB/wAAAAAAB/P//AB//58///AH//5z///Af//5P///B///4////H///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AH//gD//8Af//gP//8B///g///8H///j///8f///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAE///8gAAAc///zgAAB8///PgAAD4//8/gAAHwAAD/gAAPgAAP/AAAfAAAf+AAA+AAA/8AAB8AAB/4AAD4AAD/wAAHwAAH/gAAPgAAP/AAAfAAAf8AAA+AAAfz//x8AAAfP//z4AAAc///zgAAAT///yAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAACAAABwAAAOAAAHwAAA+AAAPgAAD+AAAfAAAP+AAA+AAA/8AAB8AAB/4AAD4AAD/wAAHwAAH/gAAPgAAP/AAAfAAAf+AAA+AAA/8AAB8AAB/wAAD4AAB/P//Hx//58///Pn//5z///Of//5P///J///4////H///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///+AAAAB///5AAAAB///nAAAAB//+fAAAAB//4+AAAAAAAB8AAAAAAAD4AAAAAAAHwAAAAAAAPgAAAAAAAfAAAAAAAA+AAAAAAAB8AAAAAAAD4AAAAAAAHwAAAAAAAPgAAAA//8fH//gD//8+f//gP//85///g///8n///j///8f///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///4AAAAH///kAAAAn//+cAAADn//58AAAPn//j4AAA/gAAHwAAD/gAAPgAAP/AAAfAAAf+AAA+AAA/8AAB8AAB/4AAD4AAD/wAAHwAAH/gAAPgAAP/AAAfAAAf8AAA+AAAfwAAB8f/+fAAAD5//+cAAADn//+QAAACf//+AAAAB///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///j///8f//+T///yf//5z///Of//nz//8+f/+Pj//z+AAAfAAAP+AAA+AAA/8AAB8AAB/4AAD4AAD/wAAHwAAH/gAAPgAAP/AAAfAAAf+AAA+AAA/8AAB8AAB/wAAD4AAB/AAAHx//58AAAPn//5wAAAOf//5AAAAJ///4AAAAH///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAYAAAAAAAA4AAAAAAAB4AAAAAAAD4AAAAAAAHwAAAAAAAPgAAAAAAAfAAAAAAAA+AAAAAAAB8AAAAAAAD4AAAAAAAHwAAAAAAAPAAAAAAAAc//8AH//gz//8Af//hP//8B///g///8H///j///8f///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///4////H///k///8n//+c///zn//58///Pn//j4//8/gAAHwAAD/gAAPgAAP/AAAfAAAf+AAA+AAA/8AAB8AAB/4AAD4AAD/wAAHwAAH/gAAPgAAP/AAAfAAAf8AAA+AAAfz//x8f/+fP//z5//+c///zn//+T///yf//+P///x///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///gAAAAf//+QAAACf//5wAAAOf//nwAAA+f/+PgAAD+AAAfAAAP+AAA+AAA/8AAB8AAB/4AAD4AAD/wAAHwAAH/gAAPgAAP/AAAfAAAf+AAA+AAA/8AAB8AAB/wAAD4AAB/P//Hx//58///Pn//5z///Of//5P///J///4////H///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAA4AAAD4AAD4AAAHwAAHwAAAPgAAPgAAAfAAAfAAAAcAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="), 32, atob("GgAAAAAAAAAAAAAAABoCABoaGhoaGhoaGhoU"), 53);
};
/* font created with:
require("sevenseg_font_tools").createFont({
  img : `
  aaaaaaaaaaaaaaaa
f  aaaaaaaaaaaaaa  b
ff  aaaaaaaaaaaa  bb
fff  aaaaaaaaaa  bbb
ffff  aaaaaaaa  bbbb
fffff          bbbbb
fffff          bbbbb
fffff          bbbbb
fffff          bbbbb
fffff          bbbbb
fffff          bbbbb
fffff          bbbbb
fffff xxxx     bbbbb
fffffxxxxxx    bbbbb
fffffxxxxxx    bbbbb
fffffxxxxxx    bbbbb
fffff xxxx     bbbbb
fffff          bbbbb
fffff          bbbbb
fffff          bbbbb
fffff          bbbbb
ffff            bbbb
fff              bbb
ff                bb
f  gggggggggggggg  b
  gggggggggggggggg
 gggggggggggggggggg
  gggggggggggggggg
e  gggggggggggggg  c
ee                cc
eee              ccc
eeee            cccc
eeeee          ccccc
eeeee          ccccc
eeeee          ccccc
eeeee          ccccc
eeeee xxxx     ccccc
eeeeexxxxxx    ccccc
eeeeexxxxxx    ccccc
eeeeexxxxxx    ccccc
eeeee xxxx     ccccc
eeeee          ccccc
eeeee          ccccc
eeeee          ccccc
eeeee          ccccc
eeeee          ccccc
eeeee          ccccc
eeeee          ccccc
eeee  dddddddd  cccc
eee  dddddddddd  ccc
ee  dddddddddddd  cc
e  dddddddddddddd  c
  dddddddddddddddd
`,width : 26,
  colonWidth : 20, // width of colon
  doubleWidth : 22, // width for double-size (eg 'W' and 'M')
  height : 53,
  export : "num"
});
*/

{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

// Actually draw the watch face
let draw = function() {
  var x = R.x + R.w/2;
  var y = R.y + R.h/2;
  g.reset().setColor(g.theme.bg).setBgColor(g.theme.fg);
  g.clearRect(R.x+1,barY+2,R.x2-1,R.y2-7);
  var date = new Date();
  var timeStr = require("locale").time(date, 1); // Hour and minute
  g.setFontAlign(0, 0).setFont("7SegBig").drawString(timeStr, x, y+41);
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
  var text = info.text.toString().toUpperCase().replace(/[^A-Z0-9.:\-]/g, "");
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
    delete Graphics.prototype.setFont7SegBig;
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
