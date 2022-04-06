Bangle.setBarometerPower(true, "app");

g.clear(1);
Bangle.loadWidgets();
Bangle.drawWidgets();
var zero = 0;
var R = Bangle.appRect;
var y = R.y + R.h/2;
var MEDIANLENGTH = 20;
var avr = [], median;
var value = 0;

Bangle.on('pressure', function(e) {
  while (avr.length>MEDIANLENGTH) avr.pop();
  avr.unshift(e.altitude);
  median = avr.slice().sort();
  g.reset().clearRect(0,y-30,g.getWidth()-10,y+30);
  if (median.length>10) {
    var mid = median.length>>1;
    value = E.sum(median.slice(mid-4,mid+5)) / 9;
    g.setFont("Vector",50).setFontAlign(0,0).drawString((value-zero).toFixed(1), g.getWidth()/2, y);
  }
});

g.reset();
g.setFont("6x8").setFontAlign(0,0).drawString(/*LANG*/"ALTITUDE (m)", g.getWidth()/2, y-40);
g.setFont("6x8").setFontAlign(0,0,3).drawString(/*LANG*/"ZERO", g.getWidth()-5, g.getHeight()/2);
setWatch(function() {
  zero = value;
}, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat:true});
