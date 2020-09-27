var buf = Graphics.createArrayBuffer(240,120,1,{msb:true});
var lastFix = {fix:0,satellites:0};
function onGPS(fix) {
  lastFix = fix;
  buf.clear();
  buf.setFontAlign(0,0);
  buf.setFont("6x8");
  buf.drawString(fix.satellites+" satellites",120,6);
  if (fix.fix) {
    var speed = require("locale").speed(fix.speed);
    var m = speed.match(/([0-9,\.]+)(.*)/); // regex splits numbers from units
    var txt = (fix.speed<20) ? fix.speed.toFixed(1) : Math.round(fix.speed);
    var value = m[1], units = m[2];
    var s = 80;
    buf.setFontVector(s);
    buf.drawString(value,120,10+s/2);
    buf.setFont("6x8",2);
    buf.drawString(units,120,s+26);
  } else {
    buf.setFont("6x8",2);
    buf.drawString("Waiting for GPS",120,56);
  }
  g.reset();
  g.drawImage({width:buf.getWidth(),height:buf.getHeight(),bpp:1,buffer:buf.buffer},0,70);
  g.flip();
}
g.clear();
onGPS(lastFix);
Bangle.loadWidgets();
Bangle.drawWidgets();

Bangle.on('GPS', onGPS);
Bangle.setGPSPower(1);
