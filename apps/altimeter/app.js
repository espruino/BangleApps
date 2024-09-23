Bangle.setBarometerPower(true, "altimeter");

g.clear(1);
Bangle.loadWidgets();
Bangle.drawWidgets();
var R = Bangle.appRect;
var y = R.y + R.h/2;
var MEDIANLENGTH = 20;
var avr = [];

function fmt(t) {
  if ((t > -100) && (t < 1000))
    t = t.toFixed(1);
  else
    t = t.toFixed(0);
  return t;
}

Bangle.on('pressure', function(e) {
  while (avr.length>MEDIANLENGTH) avr.pop();
  avr.unshift(e.altitude);
  let median = avr.slice().sort();
  g.reset().clearRect(0,y-30,g.getWidth()-10,R.h);
  if (median.length>10) {
    var mid = median.length>>1;
    var value = E.sum(median.slice(mid-4,mid+5)) / 9;
  } else {
    var value = median[median.length>>1];
  }
  t = fmt(value);

  g.setFont("Vector",50).setFontAlign(0,0).drawString(t, g.getWidth()/2, y);

  let o = Bangle.getOptions();
  let sea = o.seaLevelPressure;
  t = sea.toFixed(1) + " " + e.temperature.toFixed(1);
  if (0) {
      print("alt raw:", value.toFixed(1));
      print("temperature:", e.temperature);
      print("pressure:", e.pressure);
      print("sea pressure:", sea);
  }
    g.setFont("Vector",25).setFontAlign(-1,0).drawString(t, 10, R.y+R.h - 35);
});

function setPressure(m, a) {
  o = Bangle.getOptions();
  print(o);
  o.seaLevelPressure = o.seaLevelPressure * m + a;
  Bangle.setOptions(o);
  avr = [];
}

print(g.getFonts());
g.reset();
g.setFont("Vector:15");
g.setFontAlign(0,0);
g.drawString(/*LANG*/"ALTITUDE (m)", g.getWidth()/2, y-40);
g.drawString(/*LANG*/"SEA L (hPa) TEMP (C)", g.getWidth()/2, y+62);
g.flip();
g.setFont("6x8").setFontAlign(0,0,3).drawString(/*LANG*/"STD", g.getWidth()-5, g.getHeight()/2);
Bangle.setUI("updown", btn=> {
  if (!btn) setPressure(0, 1013.25);
  if (btn<0) setPressure(1, 1);
  if (btn>0) setPressure(1, -1);
});
