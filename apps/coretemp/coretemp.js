// Simply listen for core events and show data

Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
var btm = g.getHeight() - 1;

function onCore(c) {
  var px = g.getWidth() / 2;
  g.setFontAlign(0, 0);
  g.clearRect(0, 24, g.getWidth(), g.getHeight() - 24);

  var core = "Core: " + c.core + c.unit;
  var skin = "Skin: " + c.skin + c.unit;

  g.setFontVector(24).drawString(core, px, 45);
  g.setFontVector(24).drawString(skin, px, 65);
}
Bangle.on('CoreTemp', onCore);

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

g.reset().setFont("6x8", 2).setFontAlign(0, 0);
g.drawString("Please wait...", g.getWidth() / 2, g.getHeight() / 2 - 16);

