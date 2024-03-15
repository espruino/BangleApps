// banglejs app made by pancake
// sunrise/sunset script by Matt Kane from https://github.com/Triggertrap/sun-js

const LOCATION_FILE = 'mylocation.json';

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
  const cosLocalHourAngle = ((Math.cosDeg(zenith)) - (sinDec * (Math.sinDeg(latitude)))) / (cosDec * (Math.cosDeg(latitude)));

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
const oy = h / 1.7;

let sunRiseX = 0;
let sunSetX = 0;
const sinStep = 13;

let pos = 0;
let realTime = true;
const r = 10;

let frames = 0; // amount of pending frames to render (0 if none)
// set to 1 because pos 0 is displayed as 0-1:59
let curPos = 1; // x position of the sun
let realPos = 0; // x position of the sun depending on currentime


function formatAsTime (hour, minute) {
  return '' + ((hour < 10) ? '0' : '') + (0 | hour) +
         ':' + ((minute < 10) ? '0' : '') + (0 | minute);
}

function drawSinuses () {
  let x = 0;

  g.setColor(1, 1, 1);
  let y = ypos(x);
  while (x < w) {
    const y2 = ypos(x + sinStep);
    g.drawLine(x, y, x + sinStep, y2);
    y = y2;
    x += sinStep; // no need to draw all steps
  }

  // sea level line
  const sl0 = seaLevel(sunrise.getHours());
  const sl1 = seaLevel(sunset.getHours());
  sunRiseX = xfromTime(sunrise.getHours() + sunrise.getMinutes() / 60);
  sunSetX = xfromTime(sunset.getHours() + sunset.getMinutes() / 60);
  g.setColor(0, 0.5, 1);
  g.drawLine(0, sl0, w, sl1);
  g.drawLine(0, sl0 + 1, w, sl1 + 1);
  /*
  g.setColor(0, 0, 1);
  g.drawLine(0, sl0 + 1, w, sl1 + 1);
  g.setColor(0, 0, 0.5);
  g.drawLine(0, sl0 + 2, w, sl1 + 2);
  */
}

function drawTimes () {
  g.setColor(1, 1, 1);
  g.setFont('6x8', 2);
  g.drawString(formatAsTime(sunrise.getHours(), sunrise.getMinutes()), 10, h - 20);
  g.drawString(formatAsTime(sunset.getHours(), sunset.getMinutes()), w - 60, h - 20);
}

function drawGlow () {
  const now = new Date();
  if (frames < 1 && realTime) {
    pos = xfromTime(now.getHours() + now.getMinutes() / 60);
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

function seaLevel (hour) {
  // hour goes from 0 to 24
  // to get the X we divide the screen in 24
  return ypos(xfromTime(hour));
}

function ypos (x) {
  // offset, resulting in zenith being at the correct time
  return oy + (32 * Math.sin(((x + sunRiseX - 12) / w) * 6.28 ));
}

function xfromTime (t) {
  return (w / 24) * t;
}

function drawBall () {
  const now = new Date();
  if (frames < 1 && realTime) {
    pos = xfromTime(now.getHours() + now.getMinutes() / 60);
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

  let hours = 0.0;
  let mins = 0.0;
  if (realTime) {
    hours = now.getHours();
    mins = now.getMinutes();
  } else {
    hours = 24 * (pos / w);
    const nexth = 24 * 60 * (pos / w);
    mins = 59 - ((24 * 60) - nexth) % 60;

    // this prevents the displayed time to jump from 11:50 to 12:59 to 12:07
    if (mins == 59) {
      hours--;
    }
  }

  g.setFont('Vector', 30);
  g.setColor(realTime, 1, 1);
  g.drawString(formatAsTime(hours, mins), w / 1.9, 32);
  // day-month
  if (realTime) {
    const mo = now.getMonth() + 1;
    const da = now.getDate();
    g.setFont('6x8', 2);
    g.drawString('' + da + '/' + mo, 5, 30);
  }
}

function renderScreen () {
  const now = new Date();
  g.setColor(0, 0, 0);
  g.fillRect(0, 30, w, h);
  realPos = xfromTime(now.getHours() + now.getMinutes() / 60);
  g.setFontAlign(-1, -1, 0);

  Bangle.drawWidgets();

  drawGlow();
  drawSinuses();
  drawTimes();
  drawClock();
  drawBall();
}

Bangle.on('drag', function (tap, top) {
  if (tap.y < h / 3) {
    curPos = pos;
    initialAnimation();
  } else {
    pos = tap.x;
    realTime = false;
  }
  renderScreen();
});

Bangle.on('lock', () => {
  // TODO: render animation here
  realTime = Bangle.isLocked();
  renderScreen();
});

function initialAnimationFrame () {
  if (frames > 0) {
    let distance = (realPos - curPos) / frames;
    pos = curPos;
    curPos += distance;
    renderScreen();
    frames--;
    setTimeout(initialAnimationFrame, 50);
  } else {
    realTime = true;
    renderScreen();
  }
}

function initialAnimation () {
  const now = new Date();
  realPos = xfromTime(now.getHours() + now.getMinutes() / 60);
  const distance = Math.abs(realPos - pos);
  frames = distance / 16;
  realTime = false;
  initialAnimationFrame();
}

function renderAndQueue() {
  setTimeout(renderAndQueue, 60000 - (Date.now() % 60000));
  renderScreen();
}

function main () {
  sunRiseX = xfromTime(sunrise.getHours() + sunrise.getMinutes() / 60);
  sunSetX = xfromTime(sunset.getHours() + sunset.getMinutes() / 60);
  
  g.setBgColor(0, 0, 0);
  g.clear();
  renderAndQueue();
  initialAnimation();
}

main();
