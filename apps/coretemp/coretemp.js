Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
var btm = g.getHeight()-1;

function onCore(c) {
  var px = g.getWidth()/2;
  g.setFontAlign(0,0);
  g.clearRect(0,24,g.getWidth(),80);
  var str = c.temp + "C";
  g.setFontVector(40).drawString(str,px,45);
}
Bangle.on('Core', onCore);

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

g.reset().setFont("6x8",2).setFontAlign(0,0);
g.drawString("Please wait...",g.getWidth()/2,g.getHeight()/2 - 16);
