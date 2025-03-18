function drawTemperature(h) {
  g.reset(1).clearRect(0,24,g.getWidth(),g.getHeight());
  g.setFont("6x8",2).setFontAlign(0,0);
  var x = g.getWidth()/2;
  var y = g.getHeight()/2 + 10;
  g.drawString("Temp", x, y - 45);
  g.setFontVector(70).setFontAlign(0,0);
  if (avg.length < 10) {
  avg[avg.length] = h;
  } else {
  avg.shift();
  avg[avg.length] = h;
  h = ((avg[0] + avg[1] + avg[2] + avg[3] + avg[4] + avg[5] + avg[6] + avg[7] + avg[8] + avg[9]) / 10);
  }
  var t = require('locale').temp(h);
  g.drawString(t, x, y);
}
const avg = []; 
setInterval(function() {
  if (Bangle.getPressure){
    Bangle.getPressure().then((p)=>{
      drawTemperature(p.temperature);
    });
  } else {
    drawTemperature(E.getTemperature());
  }
}, 2000);
E.showMessage(/*LANG*/"Loading...");
Bangle.loadWidgets();
Bangle.drawWidgets();
