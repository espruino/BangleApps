function onTemperature(p) {
  g.reset(1).clearRect(0,24,g.getWidth(),g.getHeight());
  g.setFont("6x8",2).setFontAlign(0,0);
  var x = g.getWidth()/2;
  var y = g.getHeight()/2 + 10;
  g.drawString("Temp", x, y - 45);
  g.setFontVector(70).setFontAlign(0,0);
  var t = require('locale').temp(p.temperature);
  g.drawString(t, x, y);
}

function drawTemperature() {
    onTemperature({
      temperature : E.getTemperature()
    });

}


setInterval(function() {
  drawTemperature();
}, 2000);
drawTemperature();
E.showMessage("Loading...");
Bangle.loadWidgets();
Bangle.drawWidgets();