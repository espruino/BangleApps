
require("Font8x12").add(Graphics);
require("Font7x11Numeric7Seg").add(Graphics);

var setupcomplete_colour = "#ff3329";
var default_colour = "#ffffff";
var calc_display_colour = "#00FFFF";
var display_colour = default_colour;

var processing = false;
var all_extras_array = [];
var ready_to_compute = false;
var mode = "planetary";
var modeswitch = false;

var colours_switched = false;
var sensorsOn = false;

// Load fonts

// position on screen
var screenSize = g.getHeight();
console.log(screenSize);
var Xaxis = 150, Yaxis = 55;
if (screenSize <= 176) {
  setupcomplete_colour = "#00FFFF";
  Xaxis = 110;
  Yaxis = 40;
}

//lat lon settings loading
var astral_settings;
var config_file = require("Storage").open("astral.config.txt", "r");
var test_file = config_file.read(config_file.getLength());

if (test_file !== undefined) {
  astral_settings = JSON.parse(test_file);
  if (astral_settings.astral_default)
    display_colour = default_colour;
  else
    display_colour = setupcomplete_colour;
}

if (astral_settings === undefined) {
  astral_settings = {
    version: 1,
    lat: 51.5074,
    lon: 0.1278,
    astral_default: true,
    extras: [
      { name: "Andromeda", ra: "004244", de: "411609", type: 3 },
      { name: "Cigar", ra: "095552", de: "694047", type: 3 },
      { name: "Pinwheel", ra: "140313", de: "542057", type: 3 },
      { name: "Whirlpool", ra: "132953", de: "471143", type: 3 },
      { name: "Orion", ra: "053517", de: "-052328", type: 2 },
      { name: "Hercules", ra: "160515", de: "174455", type: 1 },
      { name: "Beehive", ra: "084024", de: "195900", type: 1 },
      { name: "SilverCoin", ra: "004733", de: "-251718", type: 3 },
      { name: "Lagoon", ra: "180337", de: "-242312", type: 2 },
      { name: "Trifid", ra: "180223", de: " -230148", type: 2 },
      { name: "Dumbbell", ra: "195935", de: "224316", type: 2 },
      { name: "Pleiades", ra: "034724", de: "240700", type: 1 }
    ]
  };
  config_file = require("Storage").open("astral.config.txt", "w");
  config_file.write(JSON.stringify(astral_settings));
}

var compass_heading = "--";
var current_moonphase;
var year;
var month;
var day;
var hour;
var mins;
var secs;

var calc = {
  lat_degrees: "",
  lat_minutes: "",
  lon_degrees: "",
  lon_minutes: "",
  month: "",
  day: "",
  hour: "",
  minute: "",
  second: "",
  thisday: "",
  south: "",
  north: "",
  west: "",
  east: ""
};

var pstrings = [];

var pname = new Array("Mercury", "Venus", "Sun",
  "Mars", "Jupiter", "Saturn ",
  "Uranus ", "Neptune", "Pluto");

function acos_estimate(x) {
  return (-0.69813170079773212 * x * x - 0.87266462599716477) * x + 1.5707963267948966;
}

function ConvertDEGToDMS(deg, lat) {
  var absolute = Math.abs(deg);
  var degrees = Math.floor(absolute);
  var minutesNotTruncated = (absolute - degrees) * 60;
  var minutes = Math.floor(minutesNotTruncated);
  return minutes;
}

function test() {
  // coords = [42.407211,-71.082439];
  coords = [astral_settings.lat, astral_settings.lon];
  //coords = [-33.8688, 133.775];
  calc.lat_degrees = Math.abs(coords[0]).toFixed(0);
  calc.lon_degrees = Math.abs(coords[1]).toFixed(0);

  calc.lat_minutes = ConvertDEGToDMS(coords[0], true).toString();
  calc.lon_minutes = ConvertDEGToDMS(coords[1]).toString();

  if (coords[1] < 0) {
    calc.west = false;
    calc.east = true;
  }
  else {
    calc.west = true;
    calc.east = false;
  }
  if (coords[0] < 0) {
    calc.south = true;
    calc.north = false;
  }
  else {
    calc.south = false;
    calc.north = true;
  }
}

var DEGS = 180 / Math.PI;                  // convert radians to degrees
var RADS = Math.PI / 180;                  // convert degrees to radians
var EPS = 1.0e-12;                      // machine error constant

// right ascension, declination coordinate structure
function coord() {
  ra = parseFloat("0");              // right ascension [deg]
  dec = parseFloat("0");              // declination [deg]
  rvec = parseFloat("0");              // distance [AU]
}

// altitude, azimuth coordinate structure
function horizon() {
  alt = parseFloat("0");               // altitude [deg]
  az = parseFloat("0");               // azimuth [deg]
}

// orbital element structure
function elem() {
  a = parseFloat("0");                 // semi-major axis [AU]
  e = parseFloat("0");                 // eccentricity of orbit
  i = parseFloat("0");                 // inclination of orbit [deg]
  O = parseFloat("0");                 // longitude of the ascending node [deg]
  w = parseFloat("0");                 // longitude of perihelion [deg]
  L = parseFloat("0");                 // mean longitude [deg]
}

function process_extras_coord(coord_string) {
  var extras_second = parseInt(coord_string.slice(-2));
  var extras_minute;
  var extras_hour;
  var extras_calc;

  var extras_signcheck = coord_string.charAt(0);

  if (extras_signcheck == "-") {
    extras_minute = parseInt(coord_string.slice(3, -2));
    extras_hour = parseInt(coord_string.slice(1, 3));
    extras_calc = (extras_hour + extras_minute / 60 + extras_second / 3600) * -1;
  }
  else {
    extras_minute = parseInt(coord_string.slice(2, -2));
    extras_hour = parseInt(coord_string.slice(0, 2));
    extras_calc = extras_hour + extras_minute / 60 + extras_second / 3600;
  }
  return extras_calc;
}

// compute ...
function compute() {
  var lat_degrees = parseInt(calc.lat_degrees, 10);
  var lat_minutes = parseInt(calc.lat_minutes, 10);
  var lon_degrees = parseInt(calc.lon_degrees, 10);
  var lon_minutes = parseInt(calc.lon_minutes, 10);

  var now = new Date();
  year = now.getFullYear();
  month = now.getMonth() + 1;
  day = now.getDay();
  hour = now.getHours();
  mins = now.getMinutes();
  secs = now.getSeconds();

  if (isNaN(lat_degrees) || (lat_degrees < 0) || (lat_degrees >= 90) ||
    isNaN(lat_minutes) || (lat_minutes < 0) || (lat_minutes >= 60) ||
    isNaN(lon_degrees) || (lon_degrees < 0) || (lon_degrees >= 180) ||
    isNaN(lon_minutes) || (lon_minutes < 0) || (lon_minutes >= 60)) {
    print("Invalid input!");
    return;
  }

  var lat = dms2real(lat_degrees, lat_minutes, 0);
  var lon = dms2real(lon_degrees, lon_minutes, 0);
  if (calc.south == true) lat = -lat;
  if (calc.west == true) lon = -lon;

  // compute day number for date/time
  var dn = day_number(year, month, day, hour, mins);

  var p;
  var obj = new coord();
  var h = new horizon();

  pstrings = [];

  if (mode == "planetary") {
    for (p = 0; p < 9; p++) {
      get_coord(obj, p, dn);
      coord_to_horizon(now, obj.ra, obj.dec, lat, lon, h);
      display_string = (pname[p] + " " + dec2str(h.alt) + " " + degr2str(h.az));

      pstrings.push(display_string);
    }
  }
  else {
    all_extras_arrray = [];
    for (p = 0; p < astral_settings.extras.length; p++) {
      var extras_ra = process_extras_coord(astral_settings.extras[p].ra);
      extras_ra *= 15;

      var extras_dec = process_extras_coord(astral_settings.extras[p].de);

      coord_to_horizon(now, extras_ra, extras_dec, lat, lon, h);
      display_string = (astral_settings.extras[p].name + " " + dec2str(h.alt) + " " + degr2str(h.az));

      all_extras_array.push([h.alt, display_string]);
    }

    all_extras_array.sort(function (a, b) {
      return b[0] - a[0];
    });

    for (p = 0; p < 9; p++) {
      pstrings.push(all_extras_array[p][1]);
    }
  }
}

// day number to/from J2000 (Jan 1.5, 2000)
function day_number(y, m, d, hour, mins) {
  var h = hour + mins / 60;
  var rv = 367 * y
    - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4)
    + Math.floor(275 * m / 9) + d - 730531.5 + h / 24;
  return rv;
}

// compute RA, DEC, and distance of planet-p for day number-d
// result returned in structure obj in degrees and astronomical units
function get_coord(obj, p, d) {
  var planet = new elem();
  mean_elements(planet, p, d);
  var ap = planet.a;
  var ep = planet.e;
  var ip = planet.i;
  var op = planet.O;
  var pp = planet.w;
  var lp = planet.L;

  var earth = new elem();
  mean_elements(earth, 2, d);
  var ae = earth.a;
  var ee = earth.e;
  var ie = earth.i;
  var oe = earth.O;
  var pe = earth.w;
  var le = earth.L;

  // position of Earth in its orbit
  var me = mod2pi(le - pe);
  var ve = true_anomaly(me, ee);
  var re = ae * (1 - ee * ee) / (1 + ee * Math.cos(ve));

  // heliocentric rectangular coordinates of Earth
  var xe = re * Math.cos(ve + pe);
  var ye = re * Math.sin(ve + pe);
  var ze = 0.0;

  // position of planet in its orbit
  var mp = mod2pi(lp - pp);
  var vp = true_anomaly(mp, planet.e);
  var rp = ap * (1 - ep * ep) / (1 + ep * Math.cos(vp));

  // heliocentric rectangular coordinates of planet
  var xh = rp * (Math.cos(op) * Math.cos(vp + pp - op) - Math.sin(op) * Math.sin(vp + pp - op) * Math.cos(ip));
  var yh = rp * (Math.sin(op) * Math.cos(vp + pp - op) + Math.cos(op) * Math.sin(vp + pp - op) * Math.cos(ip));
  var zh = rp * (Math.sin(vp + pp - op) * Math.sin(ip));

  if (p == 2)                          // earth --> compute sun
  {
    xh = 0;
    yh = 0;
    zh = 0;
  }

  // convert to geocentric rectangular coordinates
  var xg = xh - xe;
  var yg = yh - ye;
  var zg = zh - ze;

  // rotate around x axis from ecliptic to equatorial coords
  var ecl = 23.439281 * RADS;            //value for J2000.0 frame
  var xeq = xg;
  var yeq = yg * Math.cos(ecl) - zg * Math.sin(ecl);
  var zeq = yg * Math.sin(ecl) + zg * Math.cos(ecl);

  // find the RA and DEC from the rectangular equatorial coords
  obj.ra = mod2pi(Math.atan2(yeq, xeq)) * DEGS;
  obj.dec = Math.atan(zeq / Math.sqrt(xeq * xeq + yeq * yeq)) * DEGS;
  obj.rvec = Math.sqrt(xeq * xeq + yeq * yeq + zeq * zeq);
}

// Compute the elements of the orbit for planet-i at day number-d
// result is returned in structure p
function mean_elements(p, i, d) {
  var cy = d / 36525;                    // centuries since J2000

  switch (i) {
    case 0: // Mercury
      p.a = 0.38709893 + 0.00000066 * cy;
      p.e = 0.20563069 + 0.00002527 * cy;
      p.i = (7.00487 - 23.51 * cy / 3600) * RADS;
      p.O = (48.33167 - 446.30 * cy / 3600) * RADS;
      p.w = (77.45645 + 573.57 * cy / 3600) * RADS;
      p.L = mod2pi((252.25084 + 538101628.29 * cy / 3600) * RADS);
      break;
    case 1: // Venus
      p.a = 0.72333199 + 0.00000092 * cy;
      p.e = 0.00677323 - 0.00004938 * cy;
      p.i = (3.39471 - 2.86 * cy / 3600) * RADS;
      p.O = (76.68069 - 996.89 * cy / 3600) * RADS;
      p.w = (131.53298 - 108.80 * cy / 3600) * RADS;
      p.L = mod2pi((181.97973 + 210664136.06 * cy / 3600) * RADS);
      break;
    case 2: // Earth/Sun
      p.a = 1.00000011 - 0.00000005 * cy;
      p.e = 0.01671022 - 0.00003804 * cy;
      p.i = (0.00005 - 46.94 * cy / 3600) * RADS;
      p.O = (-11.26064 - 18228.25 * cy / 3600) * RADS;
      p.w = (102.94719 + 1198.28 * cy / 3600) * RADS;
      p.L = mod2pi((100.46435 + 129597740.63 * cy / 3600) * RADS);
      break;
    case 3: // Mars
      p.a = 1.52366231 - 0.00007221 * cy;
      p.e = 0.09341233 + 0.00011902 * cy;
      p.i = (1.85061 - 25.47 * cy / 3600) * RADS;
      p.O = (49.57854 - 1020.19 * cy / 3600) * RADS;
      p.w = (336.04084 + 1560.78 * cy / 3600) * RADS;
      p.L = mod2pi((355.45332 + 68905103.78 * cy / 3600) * RADS);
      break;
    case 4: // Jupiter
      p.a = 5.20336301 + 0.00060737 * cy;
      p.e = 0.04839266 - 0.00012880 * cy;
      p.i = (1.30530 - 4.15 * cy / 3600) * RADS;
      p.O = (100.55615 + 1217.17 * cy / 3600) * RADS;
      p.w = (14.75385 + 839.93 * cy / 3600) * RADS;
      p.L = mod2pi((34.40438 + 10925078.35 * cy / 3600) * RADS);
      break;
    case 5: // Saturn
      p.a = 9.53707032 - 0.00301530 * cy;
      p.e = 0.05415060 - 0.00036762 * cy;
      p.i = (2.48446 + 6.11 * cy / 3600) * RADS;
      p.O = (113.71504 - 1591.05 * cy / 3600) * RADS;
      p.w = (92.43194 - 1948.89 * cy / 3600) * RADS;
      p.L = mod2pi((49.94432 + 4401052.95 * cy / 3600) * RADS);
      break;
    case 6: // Uranus
      p.a = 19.19126393 + 0.00152025 * cy;
      p.e = 0.04716771 - 0.00019150 * cy;
      p.i = (0.76986 - 2.09 * cy / 3600) * RADS;
      p.O = (74.22988 - 1681.40 * cy / 3600) * RADS;
      p.w = (170.96424 + 1312.56 * cy / 3600) * RADS;
      p.L = mod2pi((313.23218 + 1542547.79 * cy / 3600) * RADS);
      break;
    case 7: // Neptune
      p.a = 30.06896348 - 0.00125196 * cy;
      p.e = 0.00858587 + 0.00002510 * cy;
      p.i = (1.76917 - 3.64 * cy / 3600) * RADS;
      p.O = (131.72169 - 151.25 * cy / 3600) * RADS;
      p.w = (44.97135 - 844.43 * cy / 3600) * RADS;
      p.L = mod2pi((304.88003 + 786449.21 * cy / 3600) * RADS);
      break;
    case 8: // Pluto
      p.a = 39.48168677 - 0.00076912 * cy;
      p.e = 0.24880766 + 0.00006465 * cy;
      p.i = (17.14175 + 11.07 * cy / 3600) * RADS;
      p.O = (110.30347 - 37.33 * cy / 3600) * RADS;
      p.w = (224.06676 - 132.25 * cy / 3600) * RADS;
      p.L = mod2pi((238.92881 + 522747.90 * cy / 3600) * RADS);
      break;
    default:
      print("function mean_elements() failed!");
  }
}

// compute the true anomaly from mean anomaly using iteration
//  M - mean anomaly in radians
//  e - orbit eccentricity
function true_anomaly(M, e) {
  var V, E1;

  // initial approximation of eccentric anomaly
  var E = M + e * Math.sin(M) * (1.0 + e * Math.cos(M));

  do                                   // iterate to improve accuracy
  {
    E1 = E;
    E = E1 - (E1 - e * Math.sin(E1) - M) / (1 - e * Math.cos(E1));
  }
  while (Math.abs(E - E1) > EPS);

  // convert eccentric anomaly to true anomaly
  V = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(0.5 * E));

  if (V < 0) V = V + (2 * Math.PI);      // modulo 2pi

  return V;
}

// converts hour angle in degrees into hour angle string
function ha2str(x) {
  if ((x < 0) || (360 < x)) print("function ha2str() range error!");

  var ra = x / 15;                       // degrees to hours
  var h = Math.floor(ra);
  var m = 60 * (ra - h);
  return cintstr(h, 3) + "h " + frealstr(m, 4, 1) + "m";
}

// converts declination angle in degrees into string
function dec2str(x) {
  if ((x < -90) || (+90 < x)) print("function dec2str() range error!");

  var dec = Math.abs(x);
  var sgn = (x < 0) ? "-" : " ";
  var d = Math.floor(dec);
  var m = 60 * (dec - d);
  //return sgn + cintstr(d, 2) + "° " + frealstr(m, 4, 1) + "'";
  return sgn + cintstr(d, 2) + "° ";
}

// return the integer part of a number
function abs_floor(x) {
  var r;
  if (x >= 0.0) r = Math.floor(x);
  else r = Math.ceil(x);
  return r;
}

// return an angle in the range 0 to 2pi radians
function mod2pi(x) {
  var b = x / (2 * Math.PI);
  var a = (2 * Math.PI) * (b - abs_floor(b));
  if (a < 0) a = (2 * Math.PI) + a;
  return a;
}

//
// compute horizon coordinates from ra, dec, lat, lon, and utc
// ra, dec, lat, lon in  degrees
// utc is a time number in seconds
//
// results returned in h : horizon record structure
//
function coord_to_horizon(utc, ra, dec, lat, lon, h) {
  var lmst, ha, sin_alt, cos_az, alt, az;

  // compute hour angle in degrees
  ha = mean_sidereal_time(0) - ra;
  //ha = mean_sidereal_time(lon) - ra;
  if (ha < 0) ha = ha + 360;

  // convert degrees to radians
  ha = ha * RADS;
  dec = dec * RADS;
  lat = lat * RADS;


  // compute altitude in radians
  sin_alt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
  alt = Math.asin(sin_alt);

  // compute azimuth in radians
  // divide by zero error at poles or if alt = 90 deg
  cos_az = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat));
  //az = Math.acos(cos_az);

  az = acos_estimate(cos_az);

  // convert radians to degrees
  h.alt = alt * DEGS;
  h.az = az * DEGS;

  // choose hemisphere
  if (Math.sin(ha) > 0) h.az = 360 - h.az;
}

//
// "mean_sidereal_time" returns the Mean Sidereal Time in units of degrees.
// Use lon = 0 to get the Greenwich MST.
// East longitudes are positive; West longitudes are negative
//
// returns: time in degrees
//
function mean_sidereal_time(lon) {

  if ((month == 1) || (month == 2)) {
    year = year - 1;
    month = month + 12;
  }

  var a = Math.floor(year / 100);
  //   var a = Math.floor(2019 / 100);

  var b = 2 - a + Math.floor(a / 4);
  var c = Math.floor(365.25 * year);
  var da = Math.floor(30.6001 * (month + 1));

  // days since J2000.0
  var jd = b + c + da - 730550.5 + day
    + (hour + mins / 60.0 + secs / 3600.0) / 24.0;

  // julian centuries since J2000.0
  var jt = jd / 36525.0;

  // mean sidereal time
  var mst = 280.46061837 + 360.98564736629 * jd
    + 0.000387933 * jt * jt - jt * jt * jt / 38710000 + lon;

  mst = mst % 360;
  return mst;
}

// convert angle (deg, min, sec) to degrees as real
function dms2real(deg, min, sec) {
  var rv;
  if (deg < 0) rv = deg - min / 60 - sec / 3600;
  else rv = deg + min / 60 + sec / 3600;
  return rv;
}

// converts angle in degrees into string
function degr2str(x) {
  var dec = Math.abs(x);
  var sgn = (x < 0) ? "-" : " ";
  var d = Math.floor(dec);
  var m = 60 * (dec - d);
  //return sgn + cintstr(d, 3) + "° " + frealstr(m, 4, 1) + "'";
  return sgn + cintstr(d, 3) + "° ";
}

// converts latitude in signed degrees into string
function lat2str(x) {
  var dec = Math.abs(x);
  var sgn = (x < 0) ? " S" : " N";
  var d = Math.floor(dec);
  var m = 60 * (dec - d);
  //return cintstr(d, 3) + "° " + frealstr(m, 4, 1) + "'" + sgn;
  return cintstr(d, 3) + "° ";
}

// converts longitude in signed degrees into string
function lon2str(x) {
  var dec = Math.abs(x);
  var sgn = (x < 0) ? " W" : " E";
  var d = Math.floor(dec);
  var m = 60 * (dec - d);
  //return cintstr(d, 3) + "° " + frealstr(m, 4, 1) + "'" + sgn;
  return cintstr(d, 3) + "° ";
}

// format two digits with leading zero if needed
function d2(n) {
  if ((n < 0) || (99 < n)) return "xx";
  return (n < 10) ? ("0" + n) : n;
}

// UTILITY FUNCTIONS

// format an integer
function cintstr(num, width) {
  var str = num.toString(10);
  var len = str.length;
  var intgr = "";
  var i;

  for (i = 0; i < width - len; i++)    // append leading spaces
    intgr += ' ';

  for (i = 0; i < len; i++)            // append digits
    intgr += str.charAt(i);

  return intgr;
}

function frealstr(num, width, fract) {
  var str = num.toFixed(fract);
  var len = str.length;
  var real = "";
  var i;

  for (i = 0; i < width - len; i++)    // append leading spaces
    real += ' ';

  for (i = 0; i < len; i++)            // append digits
    real += str.charAt(i);

  return real;
}

function getMoonPhase() {
  var now = new Date();
  year = now.getFullYear();
  month = now.getMonth() + 1;
  day = now.getDate();

  if (month < 3) {
    year = year - 1;
    month += 12;
  }
  month = month + 1;
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09; //jd is total days elapsed
  jd /= 29.5305882; //divide by the moon cycle
  b = parseInt(jd); //int(jd) -> b, take integer part of jd
  jd -= b; //subtract integer part to leave fractional part of original jd
  b = Math.round(jd * 8); //scale fraction from 0-8 and round
  if (b >= 8) {
    b = 0; //0 and 8 are the same so turn 8 into 0
  }
  return b;
}

function write_refresh_note(colour) {
  g.setColor(colour);
  cursor = Yaxis + 50;
  if (!ready_to_compute) {
    g.drawString("mode change:", Xaxis + 50, cursor, false);
    cursor += 15;
    g.drawString("swipe up to refresh", Xaxis + 50, cursor, true /*clear background*/);
    cursor += 15;
    g.drawString("swipe left/right to cancel", Xaxis + 50, cursor, true /*clear background*/);
  }
  else
    g.drawString("updating, please wait", Xaxis + 50, cursor, false);
}

function draw_moon(phase) {
  g.setColor(display_colour);
  var moonOffset = 12;
  var mooonRadius = 25;
  if (screenSize > 176) {
    if (phase == 5) {
      g.fillCircle(200, Yaxis + moonOffset, mooonRadius);
      g.setColor("#000000");
      g.fillRect(220, 25, 240, 90);
    }
    else if (phase == 6) {
      g.fillCircle(200, Yaxis + moonOffset, mooonRadius);
      g.setColor("#000000");
      g.fillRect(200, 25, 240, 90);
    }
    else if (phase == 1) {
      g.fillCircle(200, Yaxis + moonOffset, mooonRadius);
      g.setColor("#000000");
      g.fillCircle(180, Yaxis + moonOffset, mooonRadius);
    }
    else if (phase == 4)
      g.fillCircle(200, Yaxis + moonOffset, mooonRadius);
    else if (phase == 3) {
      g.fillCircle(200, Yaxis + moonOffset, mooonRadius);
      g.setColor("#000000");
      g.fillRect(160, 25, 180, 90);
    }
    else if (phase == 2) {
      g.fillCircle(200, Yaxis + moonOffset, mooonRadius);
      g.setColor("#000000");
      g.fillRect(160, 25, 200, 90);
    }
    else if (phase == 7) {
      g.fillCircle(200, Yaxis + moonOffset, mooonRadius);
      g.setColor("#000000");
      g.fillCircle(220, Yaxis, 25);
    }
  }
  else {
    moonOffset = 12;
    //var moonOffsetX = 150;
    mooonRadius = 17;
    g.setColor(display_colour);
    if (phase != 0)
      g.fillCircle(150, Yaxis + moonOffset, mooonRadius);
    if (phase == 5) {
      g.setColor("#000000");
      g.fillRect(165, 25, 180, 90);
    }
    else if (phase == 6) {
      g.setColor("#000000");
      g.fillRect(150, 25, 240, 90);
    }
    else if (phase == 1) {
      g.setColor("#000000");
      g.fillCircle(140, Yaxis + moonOffset, mooonRadius);
    }
    else if (phase == 4)
      g.fillCircle(150, Yaxis + moonOffset, mooonRadius);
    else if (phase == 3) {
      g.setColor("#000000");
      g.fillRect(125, 25, 135, 90);
    }
    else if (phase == 2) {
      g.setColor("#000000");
      g.fillRect(125, 25, 150, 90);
    }
    else if (phase == 7) {
      g.setColor("#000000");
      g.fillCircle(160, Yaxis + moonOffset, mooonRadius);
    }
  }
  g.setColor(display_colour);
}

function autoUpdate() {
  ready_to_compute = true;
  g.setColor(display_colour);
  g.fillCircle(15, 160, 5);
  setTimeout(function () {
    print("ready");
    draw();
    secondInterval = setInterval(draw, 1000);
  }, 100);
}

function draw() {
  //print("drawing");
  if (astral_settings.astral_default)
    display_colour = default_colour;
  else if (!colours_switched)
    display_colour = setupcomplete_colour;

  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = (" " + h).substr(-2) + ":" + ("0" + m).substr(-2);
  // Reset the state of the graphics library
  g.reset();
  g.setColor(display_colour);
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg", 4);
  g.setFontAlign(1, 1); // align right bottom
  g.drawString(time, Xaxis + 23, Yaxis + 34, true /*clear background*/);

  g.setFont("6x8");
  g.setFontAlign(1, 1); // align center bottom
  // pad the date - this clears the background if the date were to change length
  var dateStr = "    " + require("locale").date(d) + "    ";

  if (screenSize < 177) {
    g.drawString(dateStr, 100, 20, true /*clear background*/);
  }
  else {
    //bangle 1
    g.drawString(dateStr, 150, 40, true /*clear background*/);
  }

  //compute location of objects
  g.setFontAlign(1, 1);
  g.setFont("6x8", 1);

  if (ready_to_compute)
    g.setColor(calc_display_colour);

  if (modeswitch)
    g.setColor("#000000");

  cursor = Yaxis + 50;
  if (pstrings.length != 0) {

    for (let i = 0; i < pstrings.length; i++) {
      g.drawString(pstrings[i], Xaxis + 40, cursor, true /*clear background*/);
      cursor += 10;
    }
    if (secondInterval) clearInterval(secondInterval);
    secondInterval = undefined;
  }
  if (ready_to_compute) {
    processing = true;
    ready_to_compute = false;
    test();
    compute();
    g.setColor("#000000");
    g.fillRect(Xaxis - 150, Yaxis + 40, Xaxis + 200, Yaxis + 200);
    modeswitch = false;
    processing = false;
    //Bangle.buzz();
  }

  current_moonphase = getMoonPhase();
  all_extras_array = [];
  if (sensorsOn) {
    g.setColor(display_colour);
    g.fillCircle(160, 160, 5);
  }
}

function SwitchSensorState() {
  if (sensorsOn) {
    print("turning sensors off");
    Bangle.setCompassPower(0);
    Bangle.setGPSPower(0);
    sensorsOn = 0;
    g.setColor("#000000");
    g.fillCircle(screenSize - 15, screenSize - 15, 7);
    //g.drawString(compass_heading, 30, 115, true /*clear background*/);
    g.fillRect(0, 100, 30, 120);
  }
  else {
    Bangle.setCompassPower(1);
    Bangle.setGPSPower(1);
    sensorsOn = 1;
    g.setColor(display_colour);
    g.fillCircle(screenSize - 15, screenSize - 15, 5);
  }
}

g.clear();
g.setColor("#000000");
g.setBgColor(0, 0, 0);
g.fillRect(0, 0, 175, 175);
current_moonphase = getMoonPhase();

Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

draw_moon(current_moonphase);
draw();

var updateInterval = setInterval(autoUpdate, 120000);
//var magInterval = setInterval(updateMag, 50);

Bangle.setCompassPower(1);
Bangle.setGPSPower(1);

var secondInterval;

autoUpdate();

setWatch(SwitchSensorState, BTN1, { repeat: true });
if(process.env.HWVERSION != 2)
  setWatch(autoUpdate, BTN3, { repeat: true });

// Show launcher when button pressed
//Bangle.setClockMode();

Bangle.on("swipe", function (directionLR, directionUD) {
  if (!processing) {
    if (-1 == directionUD) {
      g.setColor(display_colour);
      g.fillCircle(15, 160, 5);
      ready_to_compute = true;
    }
    else if (-1 == directionLR || directionLR == 1) {
      print("attempting mode switch");
      if (mode == "planetary") mode = "extras";
      else mode = "planetary";
      g.setColor(display_colour);
      g.fillCircle(15, 160, 5);
      ready_to_compute = true;
    }
    else if (directionUD == 1) {
      SwitchSensorState();
    }

    setTimeout(function () {
      print("ready");
      draw();
      secondInterval = setInterval(draw, 1000);
    }, 100);
  }
});
//events
Bangle.on('mag', function (m) {
  if (!isNaN(m.heading)) {
    compass_heading = Math.round(m.heading);
    g.setColor(display_colour);
    if (compass_heading < 100)
      compass_heading = " " + compass_heading;
    if (sensorsOn) {
      g.setFont("8x12");
      g.setFontAlign(1, 1);
      g.drawString(compass_heading, 25, 112, true /*clear background*/);
    }
  }
  //var n = magArray.length;
  //var mean = Math.round( magArray.reduce((a, b) => a + b) / n);
  //compass_heading = mean;
});

Bangle.on('GPS', function (g) {
  if (g.fix) {
    display_colour = setupcomplete_colour;
    astral_settings.lat = g.lat;
    astral_settings.lon = g.lon;
    astral_settings.astral_default = false;
    config_file = require("Storage").open("astral.config.txt", "w");
    config_file.write(JSON.stringify(astral_settings));
  }
});
