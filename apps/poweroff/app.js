g.clear();

g.setFont("6x8",2).setFontAlign(0,0);
  var x = g.getWidth()/2;
  var y = g.getHeight()/2 + 10;
  g.drawString("Powering off...", x, y);

setTimeout(function() {
  if (Bangle.softOff) Bangle.softOff(); else Bangle.off();
}, 1000);

Bangle.loadWidgets();
Bangle.drawWidgets();
