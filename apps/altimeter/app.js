Bangle.setBarometerPower(true, "altimeter");

g.clear(1);
Bangle.loadWidgets();
Bangle.drawWidgets();
var zero = 0;
var R = Bangle.appRect;
var y = R.y + R.h/2;
var MEDIANLENGTH = 20;
var avr = [], median;
var value = 0;

function getStandardPressure(altitude) {
  const P0 = 1013.25; // standard pressure at sea level in hPa
  const T0 = 288.15; // standard temperature at sea level in K
  const g0 = 9.80665; // standard gravitational acceleration in m/s^2
  const R = 8.31432; // gas constant in J/(mol*K)
  const M = 0.0289644; // molar mass of air in kg/mol
  const L = -0.0065; // temperature lapse rate in K/m

  const temperature = T0 + L * altitude; // temperature at the given altitude
  const pressure = P0 * Math.pow((temperature / T0), (-g0 * M) / (R * L)); // pressure at the given altitude

  return pressure;
}

function convertToSeaLevelPressure(pressure, altitude) {
  return 1013.25 * (pressure / getStandardPressure(altitude));
}

Bangle.on('pressure', function(e) {
  while (avr.length>MEDIANLENGTH) avr.pop();
  avr.unshift(e.altitude);
  median = avr.slice().sort();
  g.reset().clearRect(0,y-30,g.getWidth()-10,R.h);
  if (median.length>10) {
    var mid = median.length>>1;
    value = E.sum(median.slice(mid-4,mid+5)) / 9;
    t = value-zero;
    if ((t > -100) && (t < 1000))
      t = t.toFixed(1);
    else
      t = t.toFixed(0);
    g.setFont("Vector",50).setFontAlign(0,0).drawString(t, g.getWidth()/2, y);
    sea = convertToSeaLevelPressure(e.pressure, value-zero);
    t = sea.toFixed(1) + " " + e.temperature.toFixed(1);
    if (0) {
      print("alt raw:", value.toFixed(1));
      print("temperature:", e.temperature);
      print("pressure:", e.pressure);
      print("sea pressure:", sea);
      print("std pressure:", getStandardPressure(value-zero));
    }
    g.setFont("Vector",25).setFontAlign(-1,0).drawString(t,
                                                        10, R.y+R.h - 35);
  }
});

print(g.getFonts());
g.reset();
g.setFont("Vector:15");
g.setFontAlign(0,0);
g.drawString(/*LANG*/"ALTITUDE (m)", g.getWidth()/2, y-40);
g.drawString(/*LANG*/"SEA L (hPa) TEMP (C)", g.getWidth()/2, y+62);
g.flip();
g.setFont("6x8").setFontAlign(0,0,3).drawString(/*LANG*/"ZERO", g.getWidth()-5, g.getHeight()/2);
Bangle.setUI("updown", btn=> {
  if (!btn) zero=value;
  if (btn<0) zero-=5;
  if (btn>0) zero+=5;
});
