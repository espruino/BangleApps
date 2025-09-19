// Ensure we don't advertise when we return to the clock, which stops everyone getting spammed at the conference
if (!NRF.getSecurityStatus().connected) try { NRF.sleep(); } catch (e) {}

Graphics.prototype.setFontWDXLLubrifontTC = function() {
  // Actual height 35 (34 - 0)
  // 1 BPP
  return this.setFontCustom(
    atob('AAAAAAAAAAHwAAAAB8AAAAAfAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAP4AAAD/+AAA///gAH///wB////AH///wAD//+AAA//gAAAP4AAAAAAAAAAAAAAAAAAAAAAAAP///wAH///+AD////wA////8APAAAPADwAADwA8AAA8APAAAPADwAADwA8AAA8APAAAPADwAADwA////8AP////AB////gAP///gAAAAAAABgAABgA8AAA8APAAAPAD////wA////8AH////AA////wAAAAA8AAAAAHAAAAAAAAAAAAAAEAA/4ADwA//gA8Af/4APAP//ADwD4HwA8A8A8APAPAPADwDwDwA8A8A8APAPAPADwDwDwA8A8A8AP//APAD//wDwAf/4A8AD/8AHAAAAAAAAAAAAAAAAAACADwDgBwA8A8A8APAPAPADwDwDwA8A8A8APAPAPADwDwDwA8A8A8APAPAPADwDwDwA8A8A8APgfgfAD////wAf///4AD///8AAP8H8AAAAAAAAAAAAAAD//wAAA//+AAAP//wAAD//+AAAAAHgAAAAB4AAAAAeAAAAAHgAAAAB4AAAAAeAAAAAHgAAAAB4AAB////wA////8AP////AD////wAAAAAAAAAAAAAAAAAAAAP/gAcAH/8APAD//gDwA//8A8APAPAPADwDwDwA8A8A8APAPAPADwDwDwA8A8A8APAPAPADwDwDwA8A//8APAP//ADwB//gAYAP/gAAAAAAAAAAAAAAAAAAAAD///8AB////gA////8AP////ADwPgDwA8DwA8APA8APADwPADwA8DwA8APA8APADwPADwA8D4A8APA///ADwH//wA8A//4AGAH/4AAAAAAAA4AAAAAPAAAAADwAAAAA8AAAAAPAAAAADwAAAAA8AAAAAPAAAAADwAAAAA////8AP////AB////wAP///8AAAAAAAAAAAAAAAAAAAAD/x/8AB////gA////8AP////ADwHwDwA8B4A8APAeAPADwHgDwA8B4A8APAeAPADwHgDwA8B8A8AP////AD////wAf///4AD/x/4AAAAAAAAAAAAAAAAAAAAA//gBwAf/8A8AP//gPAD//4DwA8AeA8APAHgPADwB4DwA8AeA8APAHgPADwB4DwA8AeA8APAHwPAD////wA////8AH///+AA///+AAAAAAAAAAAAAAAAfAHwAAHwB8AAB8AfAAAfAHwAAAAAAAA='),
    46,
    atob("BgwTChITEhMTDhMTBg=="),
    38|65536
  );
};

{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global

let background = require("clockbg");
background.load(); // reload if we fast loaded into here
let drawTimeout;

let shadow = Graphics.createArrayBuffer(88,40,1);
shadow.transparent=0;

// Actually draw the watch face
let draw = function() {
  var x = g.getWidth() / 2;
  var y = g.getHeight() / 2;
  g.reset(); // clear whole background (w/o widgets)
  background.fillRect(Bangle.appRect);
  var date = new Date();
  var timeStr = require("locale").time(date, 1); // Hour and minute
  var dateStr = require("locale").date(date, 0).toUpperCase()+"\n"+
                require("locale").dow(date, 0).toUpperCase();
  // draw shadow background and blur it to spread it out
  shadow.clear().setFontAlign(0, 0).setFont("WDXLLubrifontTC");
  shadow.drawString(timeStr, 44, 20);
  shadow.filter([
    1,6,15,20,15,6,1,
    6,36,90,120,90,36,6,
    15,90,225,300,225,90,15,
    20,120,300,400,300,120,20,
    15,90,225,300,225,90,15,
    6,36,90,120,90,36,6,
    1,6,15,20,15,6,1,
  ], { w:7, h:7, div:4 });
  // draw shadow
  g.setFontAlign(0, 0).setFont("WDXLLubrifontTC:2").setColor(g.theme.bg)
    .drawImage(shadow,x,y,{rotate:0,scale:2});
  // draw main text in white
  g.setColor(g.theme.fg).drawString(timeStr, x, y);
  g.setFontAlign(0, 0).setFont("17");
  y+=46;
  g.setBgColor(g.theme.bg).clearRect({x:x-45,y:y-20,x2:x+46,y2:y+18,r:5});
  g.drawString(dateStr, x, y);

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};

let onTap = function(e) { // Show QR on double tap
  if (e.dir!="front" || !e.double) return;
  Bangle.setUI({
    mode : "custom",
    btn : function() {
      Bangle.showClock();
    }, swipe : function() {
      Bangle.showClock();
    }, remove : function() { // this allows fast load
      g.clear();
      require("widget_utils").show();
      Bangle.setLCDTimeout(require("Storage").readJSON("setting.json").timeout||10);
    }
  });
  require("widget_utils").hide();
  let url = (require("Storage").readJSON("webaisummit.json",1)||{}).socialurl || "https://www.espruino.com";
  let img = require("libqr").getImage(url);
  var scale = Math.floor(g.getHeight()/(g.imageMetrics(img).height+2));
  g.clear().drawImage(img,88,88,{rotate:0,scale:scale});
  Bangle.setLCDPower(1);
  Bangle.setLCDTimeout(0);
  Bangle.setLocked(0);
};


let oldTheme = g.theme;
g.setTheme({
  fg : 0xFFFF,  // foreground colour
  bg : 0,       // background colour
  fg2 : 0xFFFF,  // accented foreground colour
  bg2 : 0x0007,  // accented background colour
  fgH : 0xFFFF,  // highlighted foreground colour
  bgH : 0x02F7,  // highlighted background colour
  dark : true,  // Is background dark (e.g. foreground should be a light colour)
});
// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    g.setTheme(oldTheme);
    background.unload(); // free memory from background
    delete Graphics.prototype.setFontWDXLLubrifontTC;
    Bangle.removeListener("tap", onTap);
  },
  redraw: draw,
});
Bangle.on("tap", onTap);
Bangle.loadWidgets();
draw();
setTimeout(Bangle.drawWidgets,0);

}
