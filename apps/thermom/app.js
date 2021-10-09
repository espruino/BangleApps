function onTemperature(p) {
  g.reset(1).clearRect(0,24,g.getWidth(),g.getHeight());
  g.setFont("6x8",2).setFontAlign(0,0);
  var x = g.getWidth()/2;
  var y = g.getHeight()/2 + 10;
  g.drawString("Temperature", x, y - 45);
  g.setFontVector(70).setFontAlign(0,0);
  g.drawString(p.temperature.toFixed(1), x, y);
}

function drawTemperature() {
  if (Bangle.getPressure) {
    Bangle.getPressure().then(onTemperature);
  } else {
    onTemperature({
      temperature : E.getTemperature()
    });
  }
}


setInterval(function() {
  drawTemperature();
}, 20000);
drawTemperature();
E.showMessage("Loading...");
Bangle.loadWidgets();
Bangle.drawWidgets();