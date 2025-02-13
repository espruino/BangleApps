const LOCATION_FILE = "mylocation.json";
let location;

var Utils = require("graphics_utils");
var SunCalc = require("suncalc");
var RADII = {
  moon:   40,
  arcMin: 48,
  arcMax: 63,
  dots:   55,
  needle: 54,
};
var COL = {
  moon:   65535, // 
  txture: 33792, // 0.5 ,0.5,0
  shadow:  8196, // .125,0,   .125
  day:    40159, //0.6,  0.6,1
  night:      6, //  0,  0,  0.2
  ndots:   2047, //  0,  1,  1  cyan
  ddots:      0,
  needle: 63488, //  1,  0,  0  red
  stime:   2047
};
const TAU = 2.0 * Math.PI;
const MX = g.getWidth() / 2,
  MY = 24 + 3 + RADII.arcMax;
const DAY_MILLIS = 86400000;
const M_POS = {
  x: MX,
  y: MY,
  r: RADII.moon
};
// images
const moon_texture = {
  width: 80,
  height: 80,
  bpp: 1,
  transparent: 0,
  buffer: require("heatshrink").decompress(atob("ABsRqAJHkEiBA0N0uq1AIEgNVqtRqoJEgUiAAQJEioTBAAIzEl2q12oxATECQdVioJD/eqne60UCHQoADoAJBgf+xWrFIOACYUFCYo8Cj/73f70er0ROHAANUBIM//3///q1WIFAV1qtXCggJB//7CYO6keikBOHKAUDCIInClSgCgonBu4TK1W73ShBMQxkCh5OC//uFIInBi91q5PFCYISC3er//iOwXVE41UCYf+9//9AnCJopVBqEv/+/3//E4P6kUgJw4nDKAP+14TB1Xoq4hBEwYFBqgnB3Wr3e737KB/QnIqp3B32OKAYTBE4Z4BAoYnBEoRSC0fyE5ITBJ4WuCYP4J4J3CeQQFClbvBJgOqn5kBnRPKTwJMB1B4B92qEgQACJ4JTBkYnBYwOilYsBO5NUhYmB9+qxGC9TxBEYTvFqki3Y8B1Uikei3+oionIgGrO4OqwGC9H/xATK1/7E4UAnU7kATIqEAl/uE4WA12u0ATJgSgB/+ikUgnW70EFCY9AgGDE4PowEAlWowEBCZJ4BneggUgkRSBCZEAgEKJoIEBgEIAYQOCKYcVBIMqJgIEBgQSCgAQBqiJDRQIOBEwYAEMgNRiITBqKKBCYJJBE4xQGMQIABlBPHHgInDHQQjEAQJTCHgbFEABg8EBg5SDCgxNDABI="))
};
const needle = {
  width: 23,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob("//+B///D///AAAHgAADgAAHAAA9///j//+H//gA=")
};

/* 
 now use SunCalc.getMoonIllumination()
 previously used these:
 https://github.com/espruino/BangleApps/blob/master/apps/widmp/widget.js
 https://github.com/deirdreobyrne/LunarPhase
 modified to be based on millisec instead of sec, and to use tau = 2*pi
*/

// requires the myLocation app
function loadLocation() {
  location = require("Storage").readJSON(LOCATION_FILE, 1) || {
    "lat": 45,
    "lon": -71.3,
    "location": "Nashua"
  }; //{"lat":51.5072,"lon":0.1276,"location":"London"};
}

function drawMoon(shadowShape) {
  g.setColor(0, 0, 0).fillCircle(MX, MY, RADII.arcMax + 3);
  g.setColor(COL.moon).fillCircle(MX, MY, RADII.moon - 1);
  g.setColor(COL.txture).drawImage(moon_texture, MX, MY, {
    rotate: 0
  });
  // TODO: can set the rotation here to the parallacticAngle from getMoonPosition
  g.setColor(COL.shadow).fillPoly(shadowShape);
  // TODO: set rotation of the fillPoly? parallactic-mp.angle I think. 
  // Use g.transformVertices to do the rotation
}

function drawDayRing(times) {
  let r_ = RADII.arcMin;
  let rm = RADII.arcMax;
  let rd = RADII.dots;
  let radT = [tToRad(times[0]), tToRad(times[1])];
  let hhmm = [require("locale").time(times[0], 1), require("locale").time(times[1], 1)];
  g.setColor(COL.day);
  Utils.fillArc(g, MX, MY, r_, rm, radT[0], radT[1]);
  g.setColor(COL.night);
  Utils.fillArc(g, MX, MY, r_, rm, radT[1] - TAU, radT[0]);
  // write sunrise/sunset times
  g.setFont('6x8').setColor(COL.stime);
  g.setFontAlign(0, 1, 3).drawString(hhmm[0], MX - rm - 2, MY);
  g.setFontAlign(0, 1, 1).drawString(hhmm[1], MX + rm + 2, MY);
  // draw dots
  let edges = [];
  let isDay = false;
  let flag = false;
  if (radT[1] > TAU) {
    edges = [radT[1] - TAU, radT[0]];
    g.setColor(COL.ddots);
    isDay = true;
  } else {
    edges = [radT[0], radT[1]];
    g.setColor(COL.ndots);
    isDay = false;
  }
  for (var i = 0; i < 24; i++) {
    let a = i * TAU / 24;
    if (!flag && a > edges[0] && a < edges[1]) {
      //first cross
      if (isDay) {
        g.setColor(COL.ndots);
      } else {
        g.setColor(COL.ddots);
      }
      flag = true;
    } else if (flag && a > edges[1]) {
      //second cross
      if (isDay) {
        g.setColor(COL.ddots);
      } else {
        g.setColor(COL.ndots);
      }
      flag = false;
    }
    let dotSize = (i % 3 == 0) ? 2 : 1;
    let pX = MX + Math.cos(a) * rd;
    let pY = MY + Math.sin(a) * rd;
    g.fillCircle(pX, pY, dotSize);
  }
  let labels = ['6P', '12A', '6A', '12P'];
  let qX = [rd - 9, 2, 11 - rd, 2];
  let qY = [1, rd - 10, 1, 12 - rd];
  g.setFont('4x6').setFontAlign(0, 0, 0).setColor(COL.ndots);
  for (var j = 0; j < 4; j++) {
    g.drawString(labels[j], MX + qX[j], MY + qY[j]);
  }
}


function drawHHMM(d) {
  var HM = require("locale").time(d, 1 /*omit seconds*/ ).split(":");
  // write digital time
  g.setBgColor(0, 0, 0).setColor(1, 1, 1).setFontVector(45);
  g.setFontAlign(1, 1, 0).drawString("    " + HM[0], MX - 20, g.getHeight() + 3);
  g.setFontAlign(-1, 1, 0).drawString(HM[1] + "    ", MX + 30, g.getHeight() + 3);
  // TODO: use the meridian text AM/PM or blank for 24 hr.
  // var meridian = require("locale").meridian(d);
}

function moonShade(pos, mp) {
  pos = pos !== undefined ? pos : M_POS;
  mp = mp !== undefined ? mp : SunCalc.getMoonIllumination(new Date());
  // pos has x,y, r for the drawing, mp is from SunCalc Moon Illumination
  let k = mp.fraction;
  // k is the percent along the equator of the terminator
  const pts = Math.min(pos.r >> 1, 32);
  // this gives r/2 pts on the way down and up, capped at 64 total for polyfill
  let a = [],
    b = [],
    s1 = 1,
    s2 = 0;
  // scale s1 is 1 or -1 for fixed edge of the shadow; defined via case switches below
  // scale s2 factor for the moving edge of the shadow
  // need to do some computation to simplify for new/full moon if k 'close enough' to 0 or 1/-1
  //  
  let isWaxing = (mp.phase < 0.5);
  s1 = isWaxing ? -1 : 1;
  s2 = isWaxing ? 1 - 2 * k : 2 * k - 1;
  let tr = (pos.r + 1);
  for (var i = 0; i < pts; i++) {
    // down stroke on the outer shadow
    var t = i * Math.PI / (pts + 1); //pts+1 so we leave the last point for the starting of going up
    let cirX = Math.sin(t) * tr;
    let cirY = Math.cos(t) * tr;
    a.push(pos.x + s1 * cirX); //x
    a.push(pos.y + cirY); //y
    b.push(pos.x + s2 * cirX); //x for shadow edge
    b.push(pos.y - cirY); //y going up for shadow edge
  }
  return a.concat(b);
}

function tToRad(date) {
  date = (date !== undefined) ? new Date(date.getTime()) : new Date();
  let milli = date - new Date(date.setHours(0, 0, 0, 0));
  return (milli / DAY_MILLIS + 0.25) * TAU;
}

function draw(date) {
  var d = date !== undefined ? date : new Date();
  var a = tToRad(d),
    shape = moonShade(M_POS, SunCalc.getMoonIllumination(d)),
    sTimes = SunCalc.getTimes(d, location.lat, location.lon),
    daylight = [sTimes.sunrise, sTimes.sunset];
  //clear time area
  g.clearRect(Bangle.appRect); //g.setColor(0).fillRect(0, 176 - 45, 176, 176);
  drawMoon(shape);
  drawDayRing(daylight);
  drawHHMM(d);
  // draw pointer 
  // TODO: Maybe later make this an overlay that can be removed?? -avoid drawing so much every minute/second
  g.setColor(COL.needle).drawImage(needle, MX + RADII.needle * Math.cos(a), MY + RADII.needle * Math.sin(a), {
    rotate: a
  });

}
/*
const shotTimes = [1720626960000, 1729184400000, 1738298880000, 1717575420000];
let desc =`first quarter -2 days moon at 10:20 in the summer
  jun 10 2024 10:56
full moon at 12 noon near fall equinox
  Sep 17 2024 12:00
new moon at 11pm in winter
 dec 30 2024 23:48
3rd quarter  moon at 03:17 am
  May 5 2024 03:17`

function screenshots(times) {
  let d = new Date();
  for (let t of times) {
    d.setTime(t);
    draw(d);
    g.dump();
  }
}
*/
// Clear the screen once, at startup
g.reset();
// requires the myLocation app
loadLocation();
g.setBgColor(0, 0, 0).clear();
// draw immediately at first
draw();
// now draw every second
// eventually maybe update the moon just every hour??
var secondInterval = setInterval(draw, 10000); //was 1000
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', on => {
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 10000); //was 1000
    draw(); // draw immediately
  }
});
/* Show launcher when middle button pressed
This should be done *before* Bangle.loadWidgets so that
widgets know if they're being loaded into a clock app or not */
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
g.setTheme({
  fg: "#fff",
  bg: "#000",
  fg2: "#fff",
  bg2: "#004",
  fgH: "#fff",
  bgH: "#00f",
  dark: true
});
Bangle.drawWidgets();