// Calculate sunrise and sunset times for a given date and location.
// This code is copied from IonicaBizau's project on github:
// https://github.com/IonicaBizau/sundown

// This code is based heavily on this page:
// http://astro-urseanu.ro/rasarit_soare_blank.html
//
// Probably they took it from another place. It's the common algorithm to
// calculate the sunset, but I found this to be the closest to the sunset times calculated by Google.

/**
 * sundown
 * Calculate sunset and sunrise times for given date and coordinates.
 *
 * @name sundown
 * @function
 * @param {Date} d The date you want to find the sun data for.
 * @param {Number} lat The latitude.
 * @param {Number} lon The longitude.
 * @returns {Object} An object containing:
 *
 *    - `sunrise` (Object):
 *      - `raw_time` (Array): An array of two numbers (hours and minutes)
 *      - `time` (String): Formatted sunrise time (`HH:mm`)
 *    - `sunset` (Object):
 *      - `raw_time` (Array): An array of two numbers (hours and minutes)
 *      - `time` (String): Formatted sunset time (`HH:mm`)
 *    - `date` (Date): The provided date.
 *    - `coordinates` (Array): An array of latitude and longitude values.
 *
 */
function newCalculation(d, lat, lon) {

  // Constants
  const PI = Math.PI;
  const DR = PI / 180;
  const K1 = 15 * DR * 1.0027379;

  ///////// Utility functions
  // Local Sidereal Time for zone
  const lst = (lon, jd, z) => {
    let s = 24110.5 + 8640184.812999999 * jd / 36525 + 86636.6 * z + 86400 * lon;
    s = s / 86400;
    s = s - Math.floor(s);
    return s * 360 * DR;
  };

  // returns value for sign of argument
  const sgn = x => x > 0 ? 1 : x < 0 ? -1 : 0;

  // format a positive integer with leading zeroes
  const zintstr = (num, width) => {
    const str = num.toString(10);
    const len = str.length;
    let intgr = "";
    let i;
    for (i = 0; i < width - len; i++) // append leading zeroes
      intgr += '0';
    for (i = 0; i < len; i++) // append digits
      intgr += str.charAt(i);
    return intgr;
  };

  // format an integer
  const cintstr = (num, width) => {
    const str = num.toString(10);
    const len = str.length;
    let intgr = "";
    let i;
    for (i = 0; i < width - len; i++) // append leading spaces
      intgr += ' ';
    for (i = 0; i < len; i++) // append digits
      intgr += str.charAt(i);
    return intgr;
  };

  // format a real number
  const frealstr = (num, width, fract) => {
    const str = num.toFixed(fract);
    const len = str.length;
    let real = "";
    let i;
    for (i = 0; i < width - len; i++) // append leading spaces
      real += ' ';
    for (i = 0; i < len; i++) // append digits
      real += str.charAt(i);
    return real;
  };

  ///////// Main function
  const Rise_time = [0, 0];
  const Set_time = [0, 0];

  let Sunrise = false;
  let Sunset = false;

  let Rise_az = 0.0;
  let Set_az = 0.0;
  let ph;

  const Sky = [0.0, 0.0];
  const RAn = [0.0, 0.0, 0.0];
  const Dec = [0.0, 0.0, 0.0];
  const VHz = [0.0, 0.0, 0.0];

  // determine Julian day from calendar date
  // (Jean Meeus, "Astronomical Algorithms", Willmann-Bell, 1991)
  const julian_day = d => {
    let a, b, jd;
    let gregorian;
    let month = d.getMonth() + 1;
    const day = d.getDate();
    let year = d.getFullYear();
    gregorian = (year < 1583) ? false : true;
    if ((month == 1) || (month == 2)) {
      year = year - 1;
      month = month + 12;
    }
    a = Math.floor(year / 100);
    if (gregorian) b = 2 - a + Math.floor(a / 4);
    else b = 0.0;
    jd = Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day + b - 1524.5;
    return jd;
  };

  // test an hour for an event
  const test_hour = (k, zone, t0, lat) => {
    const ha = new Array(3);
    let a, b, c, d, e, s, z;
    let hr, min, time;
    let az, dz, hz, nz;
    ha[0] = t0 - RAn[0] + k * K1;
    ha[2] = t0 - RAn[2] + k * K1 + K1;
    ha[1] = (ha[2] + ha[0]) / 2; // hour angle at half hour
    Dec[1] = (Dec[2] + Dec[0]) / 2; // declination at half hour
    s = Math.sin(lat * DR);
    c = Math.cos(lat * DR);
    z = Math.cos(90.833 * DR); // refraction + sun semidiameter at horizon
    if (k <= 0)
      VHz[0] = s * Math.sin(Dec[0]) + c * Math.cos(Dec[0]) * Math.cos(ha[0]) - z;
    VHz[2] = s * Math.sin(Dec[2]) + c * Math.cos(Dec[2]) * Math.cos(ha[2]) - z;
    if (sgn(VHz[0]) == sgn(VHz[2]))
      return VHz[2]; // no event this hour
    VHz[1] = s * Math.sin(Dec[1]) + c * Math.cos(Dec[1]) * Math.cos(ha[1]) - z;
    a = 2 * VHz[0] - 4 * VHz[1] + 2 * VHz[2];
    b = -3 * VHz[0] + 4 * VHz[1] - VHz[2];
    d = b * b - 4 * a * VHz[0];
    if (d < 0)
      return VHz[2]; // no event this hour
    d = Math.sqrt(d);
    e = (-b + d) / (2 * a);
    if ((e > 1) || (e < 0))
      e = (-b - d) / (2 * a);
    time = k + e + 1 / 120; // time of an event
    hr = Math.floor(time);
    min = Math.floor((time - hr) * 60);
    hz = ha[0] + e * (ha[2] - ha[0]); // azimuth of the sun at the event
    nz = -Math.cos(Dec[1]) * Math.sin(hz);
    dz = c * Math.sin(Dec[1]) - s * Math.cos(Dec[1]) * Math.cos(hz);
    az = Math.atan2(nz, dz) / DR;
    if (az < 0) az = az + 360;
    if ((VHz[0] < 0) && (VHz[2] > 0)) {
      Rise_time[0] = hr;
      Rise_time[1] = min;
      Rise_az = az;
      Sunrise = true;
    }
    if ((VHz[0] > 0) && (VHz[2] < 0)) {
      Set_time[0] = hr;
      Set_time[1] = min;
      Set_az = az;
      Sunset = true;
    }
    return VHz[2];
  };

  // sun's position using fundamental arguments
  // (Van Flandern & Pulkkinen, 1979)
  const sun = (jd, ct) => {
    let g, lo, s, u, v, w;
    lo = 0.779072 + 0.00273790931 * jd;
    lo = lo - Math.floor(lo);
    lo = lo * 2 * PI;
    g = 0.993126 + 0.0027377785 * jd;
    g = g - Math.floor(g);
    g = g * 2 * PI;
    v = 0.39785 * Math.sin(lo);
    v = v - 0.01 * Math.sin(lo - g);
    v = v + 0.00333 * Math.sin(lo + g);
    v = v - 0.00021 * ct * Math.sin(lo);
    u = 1 - 0.03349 * Math.cos(g);
    u = u - 0.00014 * Math.cos(2 * lo);
    u = u + 0.00008 * Math.cos(lo);
    w = -0.0001 - 0.04129 * Math.sin(2 * lo);
    w = w + 0.03211 * Math.sin(g);
    w = w + 0.00104 * Math.sin(2 * lo - g);
    w = w - 0.00035 * Math.sin(2 * lo + g);
    w = w - 0.00008 * ct * Math.sin(g);
    s = w / Math.sqrt(u - v * v); // compute sun's right ascension
    Sky[0] = lo + Math.atan(s / Math.sqrt(1 - s * s));
    s = v / Math.sqrt(u); // ...and declination
    Sky[1] = Math.atan(s / Math.sqrt(1 - s * s));
  };

  const zone = Math.round(d.getTimezoneOffset() / 60);
  let jd = julian_day(d) - 2451545; // Julian day relative to Jan 1.5, 2000

  if (sgn(zone) === sgn(lon) && zone) {
    // return {
    //     error: "Invalid input data."
    // }
  }

  lon = lon / 360;
  const tz = zone / 24;

  // centuries since 1900.0
  const ct = jd / 36525 + 1;

  // local sidereal time
  const t0 = lst(lon, jd, tz);

  // get sun position at start of day
  jd += tz;

  sun(jd, ct);

  const ra0 = Sky[0];
  const dec0 = Sky[1];

  // get sun position at end of day
  ++jd;

  sun(jd, ct);
  let ra1 = Sky[0];
  const dec1 = Sky[1];

  // make continuous
  if (ra1 < ra0) {
    ra1 += 2 * PI;
  }

  const ret = {};

  RAn[0] = ra0;
  Dec[0] = dec0;

  // check each hour of this day
  for (let k = 0; k < 24; ++k) {
    ph = (k + 1) / 24;
    RAn[2] = ra0 + (k + 1) * (ra1 - ra0) / 24;
    Dec[2] = dec0 + (k + 1) * (dec1 - dec0) / 24;
    VHz[2] = test_hour(k, zone, t0, lat);

    // advance to next hour
    RAn[0] = RAn[2];
    Dec[0] = Dec[2];
    VHz[0] = VHz[2];
  }

  // This will create the sunset and sunrise fields in the return object
  const setSunriseOrSunset = (key, time, az) => {
    const item = ret[key] = {
      raw_time: time,
      angle: az
    };
    item.time = zintstr(time[0], 2) + ":" + zintstr(time[1], 2);
    item.formatted = `${item.raw_time[0]}:${item.raw_time[1]}, az = ${item.angle}°`;
  };

  setSunriseOrSunset("sunrise", Rise_time, Rise_az);
  setSunriseOrSunset("sunset", Set_time, Set_az);

  // Special message
  if (!Sunrise && !Sunset) {
    if (VHz[2] < 0) {
      ret.special_message = "The sun is under the horizon the whole day.";
    } else {
      ret.special_message = "The sun is above the horizon the whole day.";
    }
  } else {
    if (!Sunrise) {
      ret.special_message = "The sun doesn't rise.";
    } else if (!Sunset) {
      ret.special_message = "The sun doesn't set.";
    }
  }

  ret.date = d;
  ret.coordinates = [lat, lon];

  return ret;

}

// reads timestamp, latitude and longitude or timestamp and location object
exports = function(d, lat, lon) {
  // define variables
  var filename = "sundown.json";
  var Storage = require("Storage");

  // read input from location object if needed
  if (lat === undefined) {
    lat = Storage.readJSON("mylocation.json", 1);
    if (lat === undefined) return;
  };
  if (lon === undefined) {
    lon = lat.lon;
    lat = lat.lat;
  }
  
  // load previous cached values
  var cache = Storage.readJSON(filename, true) || false;

  // check cached values
  if (cache && lat === cache.lat && lon === cache.lon &&
    cache.date[0] === d.getFullYear() && cache.date[1] === d.getMonth() + 1 && cache.date[2] === d.getDate()) {
    // return cached values
    return cache.output;
  } else {
    // calculate new values
    var output = newCalculation(d, lat, lon);
    // write values to storage as cache
    Storage.writeJSON(filename, {
      lat: lat,
      lon: lon,
      date: [d.getFullYear(), d.getMonth() + 1, d.getDate()],
      output: output
    });
    // return new values
    return output;
  }
};
