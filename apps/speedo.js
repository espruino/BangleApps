Bangle.setGPSPower(1);
Bangle.setLCDMode("doublebuffered");
var lastFix = {fix:0,satellites:0};
function onGPS(fix) {
  lastFix = fix;
  g.clear();
  g.setFontAlign(0,0);
  g.setFont("6x8");
  g.drawString(fix.satellites+" satellites",120,6);
  if (fix.fix) {
    var txt = (fix.speed<20) ? fix.speed.toFixed(1) : Math.round(fix.speed);
    var s = 80;
    g.setFontVector(s);
    g.drawString(txt,120,80);
    g.setFont("6x8",2);
    g.drawString("km/h",120,80+16+s/2);
  } else {
    g.setFont("6x8",2);
    g.drawString("Waiting for GPS",120,80);
  }
  g.flip();
}
onGPS(lastFix);
Bangle.on('GPS', onGPS);
