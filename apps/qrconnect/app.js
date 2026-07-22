{
// force colours - don't invert if theme different as this can break readers
g.setColor("#000").setBgColor("#fff").clear();
// get URL base
let url = (require("Storage").readJSON("qrconnect.json")||{}).url || "https://banglejs.com/apps/";
// get QR code
let deviceName = "Bangle.js "+NRF.getAddress().substr(-5).replace(":","");
let bmp = require("libqr").getImage(url+"?dev="+deviceName.replace(" ","%20"));
// render the QR code and device name
let fontHeight = 17;
let qrSize = g.imageMetrics(bmp).height;
let scale = Math.floor((g.getHeight()-fontHeight)/(qrSize+2));
let size = qrSize*scale;
let offsetx = (g.getWidth() - size)/2;
let offsety = (g.getHeight()-fontHeight - size)/2;
g.drawImage(bmp,offsetx,offsety,{scale:scale});
g.setFont("17").setFontAlign(0,-1).drawString(deviceName, g.getWidth()/2, offsety+size+2);
// From Settings app - force bluetooth on
try { NRF.wake(); } catch (e) { }
Bluetooth.setConsole(1);
NRF.ignoreWhitelist = 1;
// Button to return
Bangle.setUI({
  mode : "custom",
  btn(n) { Bangle.load(); },
  remove() {
    // nothing to do, but we define this to show we can fast load
  }
});
// force unlocked and backlight on
Bangle.setLocked(0);
Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
}