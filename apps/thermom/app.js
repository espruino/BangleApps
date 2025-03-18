// history of temperature readings
var history = [];


// When we get temperature...
function onTemperature(p) {
  var rect = Bangle.appRect;
  g.reset(1).clearRect(rect.x, rect.y, rect.x2, rect.y2);
  g.setFont("6x8",2).setFontAlign(0,0);
  var x = (rect.x+rect.x2)/2;
  var y = (rect.y+rect.y2)/2 + 10;
  g.drawString("Temperature:", x, y - 45);
  g.setFontVector(g.getWidth() > 200 ? 70 : 50).setFontAlign(0,0);

  // Average the last 5 temperature readings
  while (history.length>4) history.shift();
  history.push(p.temperature);
  var avrTemp = E.sum(history) / history.length;
  // Draw the temperature
  var t = require('locale').temp(avrTemp).replace("'","°");
  g.drawString(t, x, y);
}

// Gets the temperature in the most accurate way (pressure sensor or inbuilt thermistor)
function drawTemperature() {
  if (Bangle.getPressure) {
    Bangle.getPressure().then(p =>{if (p) onTemperature(p);});
  } else {
    onTemperature({
      temperature : E.getTemperature()
    });
  }
}

setInterval(function() {
  drawTemperature();
}, 5000);
Bangle.loadWidgets();
Bangle.setUI({
  mode : "custom",
  back : function() {load();}
});
E.showMessage("Reading temperature...");
drawTemperature();
