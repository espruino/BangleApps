// banglejs app made by pancake
// sunrise/sunset script by Matt Kane from https://github.com/Triggertrap/sun-js

const LOCATION_FILE = 'mylocation.json';
let location;

// requires the myLocation app
function loadLocation () {
  try {
    return require('Storage').readJSON(LOCATION_FILE, 1);
  } catch (e) {
    return { };
  }
}

Bangle.setUI("clock");
Bangle.loadWidgets();
const latlon = loadLocation();
const lat = latlon.lat || 41.38;
const lon = latlon.lon || 2.168;

/**
 *	Sunrise/sunset script. By Matt Kane.
 *
 *  Based loosely and indirectly on Kevin Boone's SunTimes Java implementation
 *  of the US Naval Observatory's algorithm.
 *
 *  Copyright © 2012 Triggertrap Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful,but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 * You should have received a copy of the GNU Lesser General Public License along with this library; if not, write to
 * the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA,
 * or connect to: http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 */

Date.prototype.sunrise = function (latitude, longitude, zenith) {
  return this.sunriseSet(latitude, longitude, true, zenith);
};

Date.prototype.sunset = function (latitude, longitude, zenith) {
  return this.sunriseSet(latitude, longitude, false, zenith);
};

Date.prototype.sunriseSet = function (latitude, longitude, sunrise, zenith) {
  if (!zenith) {
    zenith = 90.8333;
  }

  const hoursFromMeridian = longitude / Date.DEGREES_PER_HOUR;
  const dayOfYear = this.getDayOfYear();
  let approxTimeOfEventInDays;
  let sunMeanAnomaly;
  let sunTrueLongitude;
  let ascension;
  let rightAscension;
  let lQuadrant;
  let raQuadrant;
  let sinDec;
  let cosDec;
  let localHourAngle;
  let localHour;
  let localMeanTime;
  let time;

  if (sunrise) {
    approxTimeOfEventInDays = dayOfYear + ((6 - hoursFromMeridian) / 24);
  } else {
    approxTimeOfEventInDays = dayOfYear + ((18.0 - hoursFromMeridian) / 24);
  }

  sunMeanAnomaly = (0.9856 * approxTimeOfEventInDays) - 3.289;

  sunTrueLongitude = sunMeanAnomaly + (1.916 * Math.sinDeg(sunMeanAnomaly)) + (0.020 * Math.sinDeg(2 * sunMeanAnomaly)) + 282.634;
  sunTrueLongitude = Math.mod(sunTrueLongitude, 360);

  ascension = 0.91764 * Math.tanDeg(sunTrueLongitude);
  rightAscension = 360 / (2 * Math.PI) * Math.atan(ascension);
  rightAscension = Math.mod(rightAscension, 360);

  lQuadrant = Math.floor(sunTrueLongitude / 90) * 90;
  raQuadrant = Math.floor(rightAscension / 90) * 90;
  rightAscension = rightAscension + (lQuadrant - raQuadrant);
  rightAscension /= Date.DEGREES_PER_HOUR;

  sinDec = 0.39782 * Math.sinDeg(sunTrueLongitude);
  cosDec = Math.cosDeg(Math.asinDeg(sinDec));
  cosLocalHourAngle = ((Math.cosDeg(zenith)) - (sinDec * (Math.sinDeg(latitude)))) / (cosDec * (Math.cosDeg(latitude)));

  localHourAngle = Math.acosDeg(cosLocalHourAngle);

  if (sunrise) {
    localHourAngle = 360 - localHourAngle;
  }

  localHour = localHourAngle / Date.DEGREES_PER_HOUR;

  localMeanTime = localHour + rightAscension - (0.06571 * approxTimeOfEventInDays) - 6.622;

  time = localMeanTime - (longitude / Date.DEGREES_PER_HOUR);
  time = Math.mod(time, 24);

  const midnight = new Date(0);
  // midnight.setUTCFullYear(this.getUTCFullYear());
  // midnight.setUTCMonth(this.getUTCMonth());
  // midnight.setUTCDate(this.getUTCDate());

  const milli = midnight.getTime() + (time * 60 * 60 * 1000);

  return new Date(milli);
};

Date.DEGREES_PER_HOUR = 360 / 24;

// Utility functions

Date.prototype.getDayOfYear = function () {
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((this - onejan) / 86400000);
};

Math.degToRad = function (num) {
  return num * Math.PI / 180;
};

Math.radToDeg = function (radians) {
  return radians * 180.0 / Math.PI;
};

Math.sinDeg = function (deg) {
  return Math.sin(deg * 2.0 * Math.PI / 360.0);
};

Math.acosDeg = function (x) {
  return Math.acos(x) * 360.0 / (2 * Math.PI);
};

Math.asinDeg = function (x) {
  return Math.asin(x) * 360.0 / (2 * Math.PI);
};

Math.tanDeg = function (deg) {
  return Math.tan(deg * 2.0 * Math.PI / 360.0);
};

Math.cosDeg = function (deg) {
  return Math.cos(deg * 2.0 * Math.PI / 360.0);
};

Math.mod = function (a, b) {
  let result = a % b;
  if (result < 0) {
    result += b;
  }
  return result;
};

const delta = 2;
const sunrise = new Date().sunrise(lat, lon);
const sr = sunrise.getHours() + ':' + sunrise.getMinutes();
console.log('sunrise', sunrise);
const sunset = new Date().sunset(lat, lon);
const ss = sunset.getHours() + ':' + sunset.getMinutes();
console.log('sunset', sunset);

const w = g.getWidth();
const h = g.getHeight();
const oy = h / 1.7;

function ypos (x) {
  const pc = (x * 100 / w);
  return oy + (32 * Math.sin(1.7 + (pc / 16)));
}

let sunRiseX = 0;
let sunSetX = 0;
const sinStep = 12;

function drawSinuses () {
  let x = 0;

  g.setColor(0, 0, 0);
  // g.fillRect(0,oy,w, h);
  g.setColor(1, 1, 1);
  let y = oy;
  for (i = 0; i < w; i++) {
    x = i;
    x2 = x + sinStep + 1;
    y2 = ypos(i);
    if (x == 0) {
      y = y2;
    }
    g.drawLine(x, y, x2, y2);
    y = y2;
    i += sinStep; // no need to draw all steps
  }

  // sea level line
  const sl0 = seaLevel(sunrise.getHours());
  const sl1 = seaLevel(sunset.getHours());
  sunRiseX = xfromTime(sunrise.getHours());
  sunSetX = xfromTime(sunset.getHours());
  g.setColor(0.5, 0.5, 1);
  g.drawLine(0, sl0, w, sl1);
  g.setColor(0, 0, 1);
  g.drawLine(0, sl0 + 1, w, sl1 + 1);
  g.setColor(0, 0, 0.5);
  g.drawLine(0, sl0 + 2, w, sl1 + 2);
}

function drawTimes () {
  g.setColor(1, 1, 1);
  g.setFont('Vector', 20);
  g.drawString(sr, 10, h - 20);
  g.drawString(ss, w - 60, h - 20);
}

let pos = 0;
let realTime = true;
const r = 10;

function drawGlow () {
  const now = new Date();
  if (realTime) {
    pos = xfromTime(now.getHours());
  }
  const x = pos;
  const y = ypos(x - (r / 2));
  const r2 = (x > sunRiseX && x < sunSetX) ? r + 20 : r + 10;

  g.setColor(0.3, 0.3, 0.3);
  g.fillCircle(x, y, r2);
  g.setColor(0.5, 0.5, 0.5);
  g.fillCircle(x, y, r + 3);
}

function seaLevel (hour) {
  // hour goes from 0 to 24
  // to get the X we divide the screen in 24
  return ypos(xfromTime(hour));
}

function xfromTime (t) {
  return (w / 24) * t;
}

function drawBall () {
  let x = pos;
  const now = new Date();
  if (realTime) {
    x = xfromTime(now.getHours());
    pos = x;
  }
  const y = ypos(x - (r / 2));

  // glow
  g.setColor(1, 1, 0);
  if (x < sunRiseX) {
    g.setColor(0.2, 0.2, 0);
  } else if (x > sunSetX) {
    g.setColor(0.2, 0.2, 0);
  }
  g.fillCircle(x, y, r);
  g.setColor(1, 1, 1);
  g.drawCircle(x, y, r);
  let curTime = '';
  let fhours = 0.0;
  let fmins = 0.0;
  if (realTime) {
    fhours = now.getHours();
    fmins = now.getMinutes();
  } else {
    fhours = 24 * (pos / w);
    if (fhours > 23) {
      fhours = 0;
    }
    fmins = (24 - fhours) % 60;
    if (fmins < 0) {
      fmins = 0;
    }
  }
  const hours = ((fhours < 10) ? '0' : '') + (0 | fhours);
  const mins = ((fmins < 10) ? '0' : '') + (0 | fmins);
  curTime = hours + ':' + mins;
  g.setFont('Vector', 30);
  g.setColor(1, 1, 1);
  g.drawString(curTime, w / 1.9, 32);
}

function renderScreen () {
  g.setBgColor(0, 0, 0);
  g.clear();
  if (realTime) {
    Bangle.drawWidgets();
  }
  drawGlow();
  drawSinuses();
  drawTimes();
  drawBall();
}

Bangle.on('drag', function (tap, top) {
  pos = tap.x;
  realTime = false;
  renderScreen();
});

Bangle.on('lock', () => {
  realTime = Bangle.isLocked();
  renderScreen();
});
Bangle.on('tap', () => {
  realTime = true;
  renderScreen();
});
renderScreen();

setInterval(renderScreen, 60 * 1000);
