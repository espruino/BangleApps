// banglejs app made by pancake

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

const w = g.getWidth();
const h = g.getHeight();

let sunRiseX;
let sunSetX;
let solarNoonX;

let pos = 0;
let realTime = true;
const r = 10;

let frames = 0; // amount of pending frames to render (0 if none)
let curPos = 0; // x position of the sun
let realPos = 0; // x position of the sun depending on currentime

let day;
let sineLUT = new Uint8Array(w * 2); // x & y axes of sine function
let now = new Date();

let sr; // sunrise formatted as time
let ss; // sunset formatted as time

let slope; // slope for sea leve line
let yint; // y-intercept for sea leve line

const Locale = require("locale");
const SunCalc = require("suncalc");

let alt = 0; // altitude

let daystart = new Date();
daystart.setHours(0);
daystart.setMinutes(0);
daystart.setSeconds(0);

function getAltitude () {
  const p = Bangle.getPressure();
  if (p) {
    p.then(d => {
      if (d) alt = d.altitude;
    });
  }
}

function drawSinuses () {
  // messy because 1d array for 2 axes
  const sinStep = 20;
  let i;
  g.setColor(1, 1, 1);

  for (i = 0; i <= sineLUT.length - sinStep; i += sinStep) {
    g.drawLine(sineLUT[i], sineLUT[1 + i],
               sineLUT[sinStep + i], sineLUT[sinStep + 1 + i]);
  }
  g.drawLine(sineLUT[i], sineLUT[1 + i],
             sineLUT[sineLUT.length - 2], sineLUT[sineLUT.length - 1]);
}

function calcSeaLevel () {
  slope = (sineLUT[1 + sunSetX * 2] - sineLUT[1 + sunRiseX * 2]) /
          (sunSetX - sunRiseX);
  yint = sineLUT[1 + sunSetX * 2] - slope * sunSetX;
}

function drawSeaLevel () {
  // sea level line

  g.setColor(0, 0.5, 1);

  g.drawLine(0, yint, w, slope * w + yint);
  g.drawLine(0, yint + 1, w, slope * w + yint + 1);
}

function drawTimes () {
  g.setColor(1, 1, 1);
  g.setFont('6x8', 2);
  g.drawString(sr, 6, h - 20);
  g.drawString(ss, w - 64, h - 20);
}

function drawGlow () {
  g.setColor(0.2, 0.2, 0);
  // wide glow
  if (pos > sunRiseX && pos < sunSetX) {
    g.fillCircle(pos, sineLUT[1 + pos * 2], r + 20);
    g.setColor(0.5, 0.5, 0);
  }
  // smol glow
  g.fillCircle(pos, sineLUT[1 + pos * 2], r + 8);
}

function ypos (x) {
  return (h / 1.7) + (32 * Math.sin(-(2 * Math.PI * x / w
                                    - (Math.PI * solarNoonX) / w)));
}

function xFromTime (time) {
  return Math.round((w / 24) * (time.getHours() + time.getMinutes() / 60));
}

function fillSineLUT () {
  for (let i = 0; i < w; i++) {
    sineLUT[i * 2] = i;
    sineLUT[1 + i * 2] = ypos(i);
  }
}

function drawBall () {
  // glow
  if (pos > sunRiseX && pos < sunSetX) {
    g.setColor(1, 1, 1);
  } else {
    g.setColor(0.5, 0.5, 0);
  }
  g.fillCircle(pos, sineLUT[1 + pos * 2], r);
  g.setColor(1, 1, 0);
  g.drawCircle(pos, sineLUT[1 + pos * 2], r);
}
function drawClock () {
  let posTime;

  if (realTime) {
    posTime = now;

    // day-month
    const mo = now.getMonth() + 1;
    const da = now.getDate();
    g.setFont('6x8', 2);
    g.drawString(da + '/' + mo, 6, 30);
  } else {
    posTime = new Date(24 * 3600 * (pos / w) * 1000 +
                       60 * now.getTimezoneOffset() * 1000);
  }
  g.setFont('Vector', 30);
  g.setColor(realTime, 1, 1);
  g.drawString(Locale.time(posTime, 1), w / 1.9, 32);
}

function initDay () {
  getAltitude();
  sunRiseX = xFromTime(SunCalc.getTimes(now, lat, lon, alt).sunrise);
  sunSetX = xFromTime(SunCalc.getTimes(now, lat, lon, alt).sunset);
  solarNoonX = xFromTime(SunCalc.getTimes(now, lat, lon, alt).solarNoon);
  sr = Locale.time(SunCalc.getTimes(now, lat, lon, alt).sunrise, 1);
  ss = Locale.time(SunCalc.getTimes(now, lat, lon, alt).sunset, 1);
  fillSineLUT();
  calcSeaLevel();

  day = now.getDate();
}

function renderScreen () {
  now = new Date();

  if (day != now.getDate()) {
    initDay();
  }

  g.setColor(0, 0, 0);
  g.fillRect(0, 30, w, h);
  realPos = xFromTime(now);

  if (realTime) {
    pos = realPos;
  }

  // limit to screen bounds
  if (pos < 0) {
    pos = 0;
  } else if (pos > 175) {
    pos = 175;
  }

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
  realPos = xFromTime(now);
  const distance = Math.abs(realPos - pos);
  frames = distance / 16;
  realTime = false;
  initialAnimationFrame();
}

function main () {
  g.setBgColor(0, 0, 0);
  g.clear();

  initDay();

  setInterval(renderScreen, 60 * 1000);
  initialAnimation();
}

main();
