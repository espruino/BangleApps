const locale = require("locale");
const heatshrink = require("heatshrink");

const shoesIcon = heatshrink.decompress(atob("h0OwYJGgmAAgUBkgECgVJB4cSoAUDyEBkARDpADBhMAyQRBgVAkgmDhIUDAAuQAgY1DAAYA="));
const heartIcon = heatshrink.decompress(atob("h0OwYOLkmQhMkgACByVJgESpIFBpEEBAIFBCgIFCCgsABwcAgQOCAAMSpAwDyBNM"));
const powerIcon = heatshrink.decompress(atob("h0OwYQNsAED7AEDmwEDtu2AgUbtuABwXbBIUN23AAoYOCgEDFIgODABI"));
const powerIconGreen = heatshrink.decompress(atob("h0OwYQNkAEDpAEDiQEDkmSAgUJkmABwVJBIUEyVAAoYOCgEBFIgODABI"));
const powerIconRed = heatshrink.decompress(atob("h0OwYQNoAEDyAEDkgEDpIFDiVJBweSAgUJkmAAoYZDgQpEBwYAJA"));

const SETTINGS_FILE = "circlesclock.json";
let settings;

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {
    'maxHR': 200,
    'stepGoal': 10000,
    'batteryWarn': 30
  };
}

const colorFg = '#fff';
const colorBg = '#000';
const colorGrey = '#808080';
const colorRed = '#ff0000';
const colorGreen = '#00ff00';

let hrtValue;

const h = g.getHeight();
const w = g.getWidth();
const hOffset = 30;
const h1 = Math.round(1 * h / 5 - hOffset);
const h2 = Math.round(3 * h / 5 - hOffset);
const h3 = Math.round(8 * h / 8 - hOffset);
const w1 = Math.round(w / 6);
const w2 = Math.round(3 * w / 6);
const w3 = Math.round(5 * w / 6);
const radiusOuter = 22;
const radiusInner = 16;

function draw() {
  g.reset();
  g.setColor(colorBg);
  g.fillRect(0, 0, w, h);

  // time
  g.setFont("Vector:50");
  g.setFontAlign(-1, -1);
  g.setColor(colorFg);
  g.drawString(locale.time(new Date(), 1), w / 10, h1 + 8);

  // date & dow
  g.setFont("Vector:20");
  g.setFontAlign(-1, 0);
  g.drawString(locale.date(new Date()), w / 10, h2);
  g.drawString(locale.dow(new Date()), w / 10, h2 + 22);

  // Steps circle
  drawSteps();

  // Heart circle
  drawHeartRate();

  // Battery circle
  drawBattery();
}



function drawSteps() {
  const steps = getSteps();
  const blue = '#0000ff';
  g.setColor(colorGrey);
  g.fillCircle(w1, h3, radiusOuter);

  const stepGoal = settings.stepGoal;
  if (stepGoal > 0) {
    let percent = steps / stepGoal;
    if (stepGoal < steps) percent = 1;
    drawGauge(w1, h3, percent, blue);
  }

  g.setColor(colorBg);
  g.fillCircle(w1, h3, radiusInner);

  g.fillPoly([w1, h3, w1 - 15, h3 + radiusOuter + 5, w1 + 15, h3 + radiusOuter + 5]);

  g.setFont("Vector:12");
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(shortValue(steps), w1 + 2, h3);

  g.drawImage(shoesIcon, w1 - 6, h3 + radiusOuter - 6);
}

function drawHeartRate() {
  g.setColor(colorGrey);
  g.fillCircle(w2, h3, radiusOuter);

  if (hrtValue != undefined) {
    const percent = hrtValue / settings.maxHR;
    drawGauge(w2, h3, percent, colorRed);
  }

  g.setColor(colorBg);
  g.fillCircle(w2, h3, radiusInner);

  g.fillPoly([w2, h3, w2 - 15, h3 + radiusOuter + 5, w2 + 15, h3 + radiusOuter + 5]);

  g.setFont("Vector:12");
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(hrtValue != undefined ? hrtValue : "-", w2, h3);

  g.drawImage(heartIcon, w2 - 6, h3 + radiusOuter - 6);
}

function drawBattery() {
  const battery = E.getBattery();
  const yellow = '#ffff00';
  g.setColor(colorGrey);
  g.fillCircle(w3, h3, radiusOuter);

  if (battery > 0) {
    const percent = battery / 100;
    drawGauge(w3, h3, percent, yellow);
  }

  g.setColor(colorBg);
  g.fillCircle(w3, h3, radiusInner);

  g.fillPoly([w3, h3, w3 - 15, h3 + radiusOuter + 5, w3 + 15, h3 + radiusOuter + 5]);

  g.setFont("Vector:12");
  g.setFontAlign(0, 0);

  let icon = powerIcon;
  let color = colorFg;
  if (Bangle.isCharging()) {
    color = colorGreen;
    icon = powerIconGreen;
  }
  else {
    if (settings.batteryWarn != undefined && battery <= settings.batteryWarn) {
      color = colorRed;
      icon = powerIconRed;
    }
  }
  g.setColor(color);
  g.drawString(battery + '%', w3, h3);

  g.drawImage(icon, w3 - 6, h3 + radiusOuter - 6);
}

function radians(a) {
  return a * Math.PI / 180;
}


function drawGauge(cx, cy, percent, color) {
  let offset = 30;
  let end = 300;
  var i = 0;
  var r = radiusInner + 3;

  if (percent > 1) percent = 1;

  var startrot = -offset;
  var endrot = startrot - ((end - offset) * percent);

  g.setColor(color);

  // draw gauge
  for (i = startrot; i > endrot; i -= 4) {
    x = cx + r * Math.sin(radians(i));
    y = cy + r * Math.cos(radians(i));
    g.fillCircle(x, y, 4);
  }
}

function shortValue(v) {
  if (isNaN(v)) return '-';
  if (v <= 999) return v;
  if (v >= 1000 && v < 10000) {
    v = Math.floor(v / 100) * 100;
    return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  if (v >= 10000) {
    v = Math.floor(v / 1000) * 1000;
    return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
}

function getSteps() {
  if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom.getSteps();
  }
  return 0;
}

Bangle.on('lock', function(isLocked) {
  if (!isLocked) {
    Bangle.setHRMPower(1, "watch");
  } else {
    Bangle.setHRMPower(0, "watch");
  }
  drawHeartRate();
  drawSteps();
});

Bangle.on('HRM', function(hrm) {
  //if(hrm.confidence > 90){
  hrtValue = hrm.bpm;
  if (Bangle.isLCDOn())
    drawHeartRate();
  //} else {
  //  hrtValue = undefined;
  //}
});

g.clear();
Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 * so we will blank out the draw() functions of each widget and change the
 * area to the top bar doesn't get cleared.
 */
for (let wd of WIDGETS) {
  wd.draw = () => {};
  wd.area = "";
}
loadSettings();
setInterval(draw, 60000);
draw();
Bangle.setUI("clock");
