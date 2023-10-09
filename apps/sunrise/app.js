// banglejs app made by pancake
// sunrise/sunset script by Matt Kane from https://github.com/Triggertrap/sun-js

const LOCATION_FILE = 'mylocation.json';
let location;

Bangle.setUI('clock');
Bangle.loadWidgets();
// requires the myLocation app
function loadLocation () {
  try {
    return require('Storage').readJSON(LOCATION_FILE, 1);
  } catch (e) {
    return { lat: 41.38, lon: 2.168 };
  }
}
const latlon = loadLocation() || {};
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

const sunrise = new Date().sunrise(lat, lon);
const sunset = new Date().sunset(lat, lon);

const w = g.getWidth();
const h = g.getHeight();

let sunRiseX = 0;
let sunSetX = 0;

let pos = 0;
let realTime = true;
const r = 10;

let frames = 0; // amount of pending frames to render (0 if none)
let curPos = 0; // x position of the sun
let realPos = 0; // x position of the sun depending on currentime

function drawSinuses () {
  let x = 0;
  const sinStep = 13;
  let y = ypos(x);
  
  g.setColor(1, 1, 1);
  while (x < w) {
    y2 = ypos(x + sinStep);
    g.drawLine(x, y, x + sinStep, y2);
    y = y2;
    x += sinStep; // no need to draw all steps
  }
}

function drawSeaLevel () {
  // sea level line
  sunRiseX = xfromTime(sunrise.getHours(), sunrise.getMinutes());
  sunSetX = xfromTime(sunset.getHours(), sunset.getMinutes());

  const sunRiseY = ypos(sunRiseX);
  const sunSetY = ypos(sunSetX);

  g.setColor(0, 0.5, 1);

  g.drawLine(sunRiseX, sunRiseY, sunSetX, sunSetY);
  g.drawLine(sunRiseX, sunRiseY + 1, sunSetX, sunSetY + 1);

  g.drawLine(sunRiseX - r, sunRiseY, sunRiseX, sunRiseY);
  g.drawLine(sunRiseX - r, sunRiseY + 1, sunRiseX, sunRiseY + 1);

  g.drawLine(sunSetX, sunSetY, sunSetX + r, sunSetY);
  g.drawLine(sunSetX, sunSetY + 1, sunSetX + r, sunSetY + 1);
}

function drawTimes () {
  g.setColor(1, 1, 1);
  g.setFont('6x8', 2);
  g.drawString(require("locale").time(new Date((sunrise.getHours() * 3600 + 
    sunrise.getMinutes() * 60 + new Date().getTimezoneOffset() * 60) * 1000), 1),
    6, h - 20);
  g.drawString(require("locale").time(new Date((sunset.getHours() * 3600 + 
    sunset.getMinutes() * 60 + new Date().getTimezoneOffset() * 60) * 1000), 1),
    w - 64, h - 20);
}

function drawGlow () {
   if (realTime) {
    pos = xfromTime(new Date().getHours(), new Date().getMinutes());
  }
  const x = pos;
  const y = ypos(x);

  g.setColor(0.2, 0.2, 0);
  // wide glow
  if (x > sunRiseX && x < sunSetX) {
    g.fillCircle(x, y, r + 20);
    g.setColor(0.5, 0.5, 0);
  }
  // smol glow
  g.fillCircle(x, y, r + 8);
}

function ypos (x) {
  // offset, resulting in zenith being at the correct time
  return (h / 1.7) + (32 * Math.sin(((x + sunRiseX - 12) / w) * 6.28 ));
}

function xfromTime (hours, minutes) {
  return (w / 24) * (hours + minutes / 60);
}

function drawBall () {
  if (realTime) {
    pos = xfromTime(new Date().getHours(), new Date().getMinutes());
  }
  const x = pos;
  const y = ypos(x);

  // glow
  if (x > sunRiseX && x < sunSetX) {
    g.setColor(1, 1, 1);
  } else {
    g.setColor(0.5, 0.5, 0);
  }
  g.fillCircle(x, y, r);
  g.setColor(1, 1, 0);
  g.drawCircle(x, y, r);
}
function drawClock () {
  const now = new Date();
  let posTime= now;

  if (!realTime) {
    posTime = new Date(24 * 3600 * (pos / w) * 1000 +
                       60 * now.getTimezoneOffset() * 1000);
  }
  g.setFont('Vector', 30);
  g.setColor(realTime, 1, 1);
  g.drawString(require("locale").time(posTime, 1), w / 1.9, 32);

  // day-month
  if (realTime) {
    const mo = now.getMonth() + 1;
    const da = now.getDate();
    g.setFont('6x8', 2);
    g.drawString('' + da + '/' + mo, 6, 30);
  }
}

function renderScreen () {
  g.setColor(0, 0, 0);
  g.fillRect(0, 30, w, h);
  realPos = xfromTime(new Date().getHours(), new Date().getMinutes());
  g.setFontAlign(-1, -1, 0);

  Bangle.drawWidgets();

  drawGlow();
  drawSinuses();
  drawSeaLevel();
  drawTimes();
  drawClock();
  drawBall();
}

Bangle.on('drag', function (tap, top) {
  if (tap.y < h / 3) {
    initialAnimation();
  } else {
    pos = tap.x;
    realTime = false;
    renderScreen();
  }
});

Bangle.on('lock', () => {
  // TODO: render animation here
  realTime = true;
  renderScreen();
});

function initialAnimationFrame () {
  if (frames >= 1) {
    let distance = (realPos - pos) / frames;
    renderScreen();
    pos += distance;
    frames--;
    setTimeout(initialAnimationFrame, 50);
  } else {
    realTime = true;
    renderScreen();
  }
}

function initialAnimation () {
  realPos = xfromTime(new Date().getHours(), new Date().getMinutes());
  const distance = Math.abs(realPos - pos);
  frames = distance / 16;
  realTime = false;
  initialAnimationFrame();
}

function main () {
  sunRiseX = xfromTime(sunrise.getHours(), sunrise.getMinutes());
  sunSetX = xfromTime(sunset.getHours(), sunset.getMinutes());

  g.setBgColor(0, 0, 0);
  g.clear();
  setInterval(renderScreen, 60 * 1000);
  initialAnimation();
}

main();
