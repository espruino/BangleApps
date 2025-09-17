// Ensure we don't advertise when we return to the clock, which stops everyone getting spammed at the conference
if (!NRF.getSecurityStatus().connected) try { NRF.sleep(); } catch (e) {}

Graphics.prototype.setFontWDXLLubrifontTC = function() {
  // Actual height 69 (69 - 1)
  // 1 BPP
  return this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAB/4AAAAAAAAAAB/4AAAAAAAAAAB/4AAAAAAAAAAB/4AAAAAAAAAAB/4AAAAAAAAAAB/4AAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAf8AAAAAAAAAAf/8AAAAAAAAAP//8AAAAAAAAP///8AAAAAAAH////8AAAAAAH/////8AAAAAD//////4AAAAD///////wAAAD///////4AAAB///////8AAAB///////8AAAAP//////+AAAAAP/////+AAAAAAf////+AAAAAAAf////AAAAAAAAf///AAAAAAAAAf//gAAAAAAAAAP/gAAAAAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///////8AAAAD///////+AAAAH////////AAAAP////////gAAAf////////wAAA/////////4AAA/////////4AAA/4AAAAAA/4AAA/wAAAAAAf4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAf4AAA/wAAAAAAf4AAA/////////4AAA/////////4AAAf////////4AAAf////////wAAAP////////gAAAH////////AAAAD///////+AAAAA///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAADgAAA/gAAAAAAP4AAA/gAAAAAAP4AAA/wAAAAAAP4AAA/wAAAAAAf4AAA/wAAAAAAf4AAA/////////4AAA/////////4AAAf////////4AAAf////////4AAAP////////4AAAH////////4AAAD////////4AAAAf///////4AAAAAAAAAAAf4AAAAAAAAAAAP4AAAAAAAAAAAP4AAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAAAf//+AAAA/gAAB////AAAA/gAAB////gAAA/wAAD////wAAA/wAAH////wAAA/wAAP////4AAA/wAAP////4AAA/wAAP+AA/4AAA/wAAf8AAf4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/////4AAP4AAA/////4AAP4AAAf////4AAP4AAAf////wAAP4AAAP////gAAP4AAAH////AAAP4AAAD///+AAAP4AAAA///4AAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAAAAAAHwAAA/gAAPgAAP4AAA/gAAfwAAP4AAA/wAAfwAAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAAf4AAP4AAA/wAA/4AAf4AAA/8AB/+AA/4AAA/////////4AAA/////////4AAAf////////wAAAP////////gAAAH////////AAAAD///4///+AAAAB///wP//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////4AAAAAAA/////8AAAAAAA/////+AAAAAAA//////AAAAAAA//////gAAAAAA//////wAAAAAAf/////wAAAAAAH/////wAAAAAAAAAAA/4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAAf4AAAAAAAAAAA/4AAAAAAAAAAB/+AAAAAAf////////wAAA/////////4AAA/////////4AAA/////////4AAA/////////4AAA/////////4AAAf////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///4AAAHwAAAD///8AAAP4AAAH///+AAAP4AAAP////AAAP4AAAf////gAAP4AAA/////wAAP4AAA/////wAAP4AAA/4AB/wAAP4AAA/wAA/wAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAfwAAP4AAA/wAAf4AAf4AAA/wAAf4AAf4AAA/wAAf////4AAA/wAAf////4AAA/wAAP////4AAA/wAAP////wAAA/wAAH////gAAA/gAAD////AAAA/gAAB///+AAAAfAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///////8AAAAD///////+AAAAH////////AAAAP////////gAAAf////////wAAA/////////4AAA/////////4AAA/4AP/gAA/4AAA/wAH/AAAf4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAP4AAA/wAD/AAAf4AAA/wAD/AAAf4AAA/wAD/////4AAA/wAD/////4AAA/wAB/////4AAA/wAB/////wAAA/wAA/////gAAA/gAAf////AAAA/gAAP///+AAAAfAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAAAAAAAAAAA/gAAAAAAAAAAA/gAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/wAAAAAAAAAAA/8AAAAAAAAAAA/////////wAAA/////////4AAAf////////4AAAP////////4AAAH////////4AAAD////////4AAAB////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///g///8AAAAD///x///+AAAAH////////AAAAP////////gAAAf////////wAAA/////////4AAA/////////4AAA/4AD/4AA/4AAA/wAB/wAAf4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAA/wAAP4AAA/wAB/wAAf4AAA/////////4AAA/////////4AAAf////////4AAAf////////wAAAP////////gAAAH////////AAAAD///x///+AAAAA///Af//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////AAAHwAAAD////gAAP4AAAH////wAAP4AAAP////4AAP4AAAf////8AAP4AAA/////+AAP4AAA/////+AAP4AAA/4AAP+AAP4AAA/wAAH+AAP4AAA/gAAH+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/gAAD+AAP4AAA/wAAH/AAf4AAA/wAAH/AAf4AAA/////////4AAA/////////4AAA/////////4AAAf////////wAAAP////////gAAAH////////AAAAD///////+AAAAA///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf4AAA/wAAAAAA/8AAB/4AAAAAA/8AAB/4AAAAAA/8AAB/4AAAAAA/8AAB/4AAAAAA/8AAB/4AAAAAA/8AAB/4AAAAAAf4AAA/wAAAAAAAAAAAAAAAA'),
    46,
    atob("DBklFCUkJCUlHCUlDA=="),
    78|65536
  );
};

{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

// Actually draw the watch face
let draw = function() {
  var x = g.getWidth() / 2;
  var y = g.getHeight() / 2;
  g.reset().clearRect(Bangle.appRect); // clear whole background (w/o widgets)
  var date = new Date();
  var timeStr = "22:22";//require("locale").time(date, 1); // Hour and minute
  g.setFontAlign(0, 0).setFont("WDXLLubrifontTC").drawString(timeStr, x, y);
  // Show date and day of week
  var dateStr = require("locale").date(date, 0).toUpperCase()+"\n"+
                require("locale").dow(date, 0).toUpperCase();
  g.setFontAlign(0, 0).setFont("17").drawString(dateStr, x, y+48);

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

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
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
