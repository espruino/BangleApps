//Icons from https://icons8.com
//Sun and Moon calculations from https://github.com/mourner/suncalc and https://gist.github.com/endel/dfe6bb2fbe679781948c

//varibales
const storage = require('Storage');
let coords;
var timer;
var fix;

var PI   = Math.PI,
  sin  = Math.sin,
  cos  = Math.cos,
  tan  = Math.tan,
  asin = Math.asin,
  atan = Math.atan2,
  //acos = Math.acos,
  rad  = PI / 180,
  dayMs = 1000 * 60 * 60 * 24,
  J1970 = 2440588,
  J2000 = 2451545;

var SunCalc = {};

//pictures
function getImg(i) {
  var data = {
    "NewMoon": "AD8AAH/4AHwPgDwA8BwADg4AAcMAADHAAA5gAAGYAABsAAAPAAADwAAA8AAAPAAADwAAA2AAAZgAAGcAADjAAAw4AAcHAAOA8APAHwPgAf/gAA/AAA==",
    "WaxingCrescentNorth" : "AD8AAH/4AHw/gDwH8BwA/g4AH8MAB/HAAf5gAD+YAA/sAAP/AAD/wAA/8AAP/AAD/wAA/2AAP5gAD+cAB/jAAfw4AH8HAD+A8B/AHw/gAf/gAA/AAA==",
    "WaningCrescentSouth" : "AD8AAH/4AHw/gDwH8BwA/g4AH8MAB/HAAf5gAD+YAA/sAAP/AAD/wAA/8AAP/AAD/wAA/2AAP5gAD+cAB/jAAfw4AH8HAD+A8B/AHw/gAf/gAA/AAA==",
    "FirstQuarterNorth" : "AD8AAH/4AHx/gDwf8BwH/g4B/8MAf/HAH/5gB/+YAf/sAH//AB//wAf/8AH//AB//wAf/2AH/5gB/+cAf/jAH/w4B/8HAf+A8H/AHx/gAf/gAA/AAA==",
    "FirstQuarterSouth" : "AD8AAH/4AH+PgD/g8B/4Dg/+AcP/gDH/4A5/+AGf/gBv/4AP/+AD//gA//4AP/+AD//gA3/4AZ/+AGf/gDj/4Aw/+AcH/gOA/4PAH+PgAf/gAA/AAA==",
    "WaxingGibbousNorth" : "AD8AAH/4AH3/gDz/8Bw//g4f/8MH//HB//5g//+YP//sD///A///wP//8D///A///wP//2D//5g//+cH//jB//w4f/8HD/+A8//AH3/gAf/gAA/AAA==",
    "WaxingGibbousSouth" : "AD8AAH/4AH/vgD/88B//Dg//4cP/+DH//g5//8Gf//Bv//wP//8D///A///wP//8D///A3//wZ//8Gf/+Dj//gw//4cH/8OA//PAH/vgAf/gAA/AAA==",
    "FullMoon" : "AD8AAH/4AH//gD//8B///g///8P///H///5///+f///v/////////////////////////3///5///+f///j///w///8H//+A///AH//gAf/gAA/AAA==",
    "WaningGibbousNorth" : "AD8AAH/4AH/vgD/88B//Dg//4cP/+DH//g5//8Gf//Bv//wP//8D///A///wP//8D///A3//wZ//8Gf/+Dj//gw//4cH/8OA//PAH/vgAf/gAA/AAA==",
    "WaningGibbousSouth" : "AD8AAH/4AH3/gDz/8Bw//g4f/8MH//HB//5g//+YP//sD///A///wP//8D///A///wP//2D//5g//+cH//jB//w4f/8HD/+A8//AH3/gAf/gAA/AAA==",
    "LastQuarterNorth" : "AD8AAH/4AH+PgD/g8B/4Dg/+AcP/gDH/4A5/+AGf/gBv/4AP/+AD//gA//4AP/+AD//gA3/4AZ/+AGf/gDj/4Aw/+AcH/gOA/4PAH+PgAf/gAA/AAA==",
    "LastQuarterSouth" : "AD8AAH/4AHx/gDwf8BwH/g4B/8MAf/HAH/5gB/+YAf/sAH//AB//wAf/8AH//AB//wAf/2AH/5gB/+cAf/jAH/w4B/8HAf+A8H/AHx/gAf/gAA/AAA==",
    "WaningCrescentNorth" : "AD8AAH/4AH8PgD+A8B/ADg/gAcP4ADH+AA5/AAGfwABv8AAP/AAD/wAA/8AAP/AAD/wAA38AAZ/AAGf4ADj+AAw/gAcH8AOA/gPAH8PgAf/gAA/AAA==",
    "WaxingCrescentSouth" : "AD8AAH/4AH8PgD+A8B/ADg/gAcP4ADH+AA5/AAGfwABv8AAP/AAD/wAA/8AAP/AAD/wAA38AAZ/AAGf4ADj+AAw/gAcH8AOA/gPAH8PgAf/gAA/AAA=="
  };
  return {
    width : 26, height : 26, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob(data[i]))
  };
}
// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas
// date/time constants and conversions 
function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
function toDays(date)   { return toJulian(date) - J2000; }
    
// general calculations for position
var e = rad * 23.4397; // obliquity of the Earth
function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
function declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }
function azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }
function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }
function astroRefraction(h) {
  if (h < 0) // the following formula works for positive altitudes only.
    h = 0; // if h = -0.08901179 a div/0 would occur.

  // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
  // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
  return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}
    
// general sun calculations
function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }
function eclipticLongitude(M) {

  var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
    P = rad * 102.9372; // perihelion of the Earth

  return M + C + P + PI;
}
    
function sunCoords(d) {
  var M = solarMeanAnomaly(d),
    L = eclipticLongitude(M);
  return {
    dec: declination(L, 0),
    ra: rightAscension(L, 0)
  };
}
    
    
    
// adds a custom time to the times config
SunCalc.addTime = function (angle, riseName, setName) {
  times.push([angle, riseName, setName]);
};
    
// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas
function moonCoords(d) { // geocentric ecliptic coordinates of the moon
  var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
    M = rad * (134.963 + 13.064993 * d), // mean anomaly
    F = rad * (93.272 + 13.229350 * d),  // mean distance
    l  = L + rad * 6.289 * sin(M), // longitude
    b  = rad * 5.128 * sin(F),     // latitude
    dt = 385001 - 20905 * cos(M);  // distance to the moon in km

  return {
    ra: rightAscension(l, b),
    dec: declination(l, b),
    dist: dt
  };
}
    
SunCalc.getMoonPosition = function (date, lat, lng) {

  var lw  = rad * -lng,
    phi = rad * lat,
    d   = toDays(date),
    c = moonCoords(d),
    H = siderealTime(d, lw) - c.ra,
    h = altitude(H, phi, c.dec),
    // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
    pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));
  h = h + astroRefraction(h); // altitude correction for refraction
  return {
    azimuth: azimuth(H, phi, c.dec),
    altitude: h,
    distance: c.dist,
    parallacticAngle: pa
  };
};
    
// calculations for illumination parameters of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
SunCalc.getMoonIllumination = function (date) {
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var Moon = {
    phases: ['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'],
    phase: function (year, month, day) {
      let c = 0;
      let e = 0;
      let jd = 0;
      let b = 0;
      if (month < 3) {
        year--;
        month += 12;
      }
      ++month;
      c = 365.25 * year;
      e = 30.6 * month;
      jd = c + e + day - 694039.09; // jd is total days elapsed
      jd /= 29.5305882; // divide by the moon cycle
      b = parseInt(jd); // int(jd) -> b, take integer part of jd
      jd -= b; // subtract integer part to leave fractional part of original jd
      b = Math.round(jd * 8); // scale fraction from 0-8 and round
      if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0
      return {phase: b, name: Moon.phases[b]};
    }
  };
  return (Moon.phase(year, month, day));
};
    
function hoursLater(date, h) {
  return new Date(date.valueOf() + h * dayMs / 24);
}
    
// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article
SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
  var t = new Date(date);
  if (inUTC) t.setUTCHours(0, 0, 0, 0);
  else t.setHours(0, 0, 0, 0);
  var hc = 0.133 * rad,
    h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
    h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

  // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
  for (var i = 1; i <= 24; i += 2) {
    h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
    h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;
    a = (h0 + h2) / 2 - h1;
    b = (h2 - h0) / 2;
    xe = -b / (2 * a);
    ye = (a * xe + b) * xe + h1;
    d = b * b - 4 * a * h1;
    roots = 0;
    if (d >= 0) {
      dx = Math.sqrt(d) / (Math.abs(a) * 2);
      x1 = xe - dx;
      x2 = xe + dx;
      if (Math.abs(x1) <= 1) roots++;
      if (Math.abs(x2) <= 1) roots++;
      if (x1 < -1) x1 = x2;
    }
    if (roots === 1) {
      if (h0 < 0) rise = i + x1;
      else set = i + x1;
    } else if (roots === 2) {
      rise = i + (ye < 0 ? x2 : x1);
      set = i + (ye < 0 ? x1 : x2);
    }
    if (rise && set) break;
    h0 = h2;
  }
  var result = {};
  if (rise) result.rise = hoursLater(t, rise);
  if (set) result.set = hoursLater(t, set);
  if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;
  return result;
};
    
function getMPhaseComp (offset) {
  var date = new Date();
  date.setDate(date.getDate() + offset);
  var dd = String(date.getDate());
  if(dd<10){dd='0'+dd;}
  var mm = String(date.getMonth() + 1);
  if(mm<10){mm='0'+mm;}
  var yyyy = date.getFullYear();
  var phase = SunCalc.getMoonIllumination(date);
  return dd + "." + mm + "." + yyyy + ": "+ phase.name;
}
    
function getMPhaseSim (offset) {
  var date = new Date();
  date.setDate(date.getDate() + offset);
  var dd = String(date.getDate());
  if(dd<10){dd='0'+dd;}
  var mm = String(date.getMonth() + 1);
  if(mm<10){mm='0'+mm;}
  //var yyyy = date.getFullYear();
  var phase = SunCalc.getMoonIllumination(date);
  return phase.name;
}
    
function drawMoonPhase(offset, x, y){
  if (coords.lat >= 0 && coords.lat <= 90){ //Northern hemisphere
    if (getMPhaseSim(offset) == "new") {g.drawImage(getImg("NewMoon"), x, y);}
    if (getMPhaseSim(offset) == "waxing-crescent") {g.drawImage(getImg("WaxingCrescentNorth"), x, y);}
    if (getMPhaseSim(offset) == "first-quarter") {g.drawImage(getImg("FirstQuarterNorth"), x, y);}
    if (getMPhaseSim(offset) == "waxing-gibbous") {g.drawImage(getImg("WaxingGibbousNorth"), x, y);}
    if (getMPhaseSim(offset) == "full") {g.drawImage(getImg("FullMoon"), x, y);}
    if (getMPhaseSim(offset) == "waning-gibbous") {g.drawImage(getImg("WaningGibbousNorth"), x, y);}
    if (getMPhaseSim(offset) == "last-quarter") {g.drawImage(getImg("LastQuarterNorth"), x, y);}
    if (getMPhaseSim(offset) == "waning-crescent") {g.drawImage(getImg("WaningCrescentNorth"), x, y);}
  }
  else { //Southern hemisphere
    if (getMPhaseSim(offset) == "new") {g.drawImage(getImg("NewMoon"), x, y);}
    if (getMPhaseSim(offset) == "waxing-crescent") {g.drawImage(getImg("WaxingCrescentSouth"), x, y);}
    if (getMPhaseSim(offset) == "first-quarter") {g.drawImage(getImg("FirstQuarterSouth"), x, y);}
    if (getMPhaseSim(offset) == "waxing-gibbous") {g.drawImage(getImg("WaxingGibbousSouth"), x, y);}
    if (getMPhaseSim(offset) == "full") {g.drawImage(getImg("FullMoon"), x, y);}
    if (getMPhaseSim(offset) == "waning-gibbous") {g.drawImage(getImg("WaningGibbousSouth"), x, y);}
    if (getMPhaseSim(offset) == "last-quarter") {g.drawImage(getImg("LastQuarterSouth"), x, y);}
    if (getMPhaseSim(offset) == "waning-crescent") {g.drawImage(getImg("WaningCrescentSouth"), x, y);}
  }
}
    
function drawMoon(offset, x, y) {
  g.setFont("6x8");
  g.clear();
  g.drawString("Key1: day+, Key2:today, Key3:day-",x,y-30);
  g.drawString("Last known coordinates: " + coords.lat.toFixed(4) + " " + coords.lon.toFixed(4), x, y-20);
  g.drawString("Press BTN4 to update",x, y-10);

  g.drawString(getMPhaseComp(offset),x,y+30);
  drawMoonPhase(offset, x+35, y+40);
    
  g.drawString(getMPhaseComp(offset+2),x,y+70);
  drawMoonPhase(offset+2, x+35, y+80);
    
  g.drawString(getMPhaseComp(offset+4),x,y+110);
  drawMoonPhase(offset+4, x+35, y+120);
    
  g.drawString(getMPhaseComp(offset+6),x,y+150);
  drawMoonPhase(offset+6, x+35, y+160);
}

//Write coordinates to file
function updateCoords() {
  storage.write('coords.json', coords);
}

//set coordinates to default (city where I live)
function resetCoords() {
  coords = {
    lat : 52.96236,
    lon : 7.62571,
  };
  updateCoords();
}
    
function getGpsFix() {
  Bangle.on('GPS', function(fix) {
    g.clear();

    if (fix.fix == 1) {
      var gpsString = "lat: " + fix.lat.toFixed(4) + " lon: " + fix.lon.toFixed(4);
      coords.lat = fix.lat;
      coords.lon = fix.lon;
      updateCoords();
      g.drawString("Got GPS fix and wrote coords to file",10,20);
      g.drawString(gpsString,10,30);
      g.drawString("Press BTN5 to return to app",10,40);
      clearInterval(timer);
      timer = undefined;
    }
    else {
      g.drawString("Searching satellites...",10,20);
      g.drawString("Press BTN5 to stop GPS",10, 30);
    }
  });
}
    
function start() {
  var x = 10;
  var y = 50;
  var offsetMoon = 0;
  coords = storage.readJSON('coords.json',1); //read coordinates from file
  if (!coords) resetCoords(); //if coordinates could not be read, reset them
  drawMoon(offsetMoon, x, y); //offset, x, y

  //define button functions
  setWatch(function() { //BTN1
    offsetMoon++; //jump to next day
    drawMoon(offsetMoon, x, y); //offset, x, y
  }, BTN1, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() { //BTN2
    offsetMoon = 0; //jump to today
    drawMoon(offsetMoon, x, y); //offset, x, y
  }, BTN2, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() { //BTN3
    offsetMoon--; //jump to next day
    drawMoon(offsetMoon, x, y); //offset, x, y
  }, BTN3, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() { //BTN4
    g.drawString("--- Getting GPS signal ---",x, y);
    Bangle.setGPSPower(1);
    timer = setInterval(getGpsFix, 10000);
  }, BTN4, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() { //BTN5
    if (timer) clearInterval(timer);
    timer = undefined;
    Bangle.setGPSPower(0);
    drawMoon(offsetMoon, x, y); //offset, x, y
  }, BTN5, {edge:"rising", debounce:50, repeat:true});
}
    
start(); 