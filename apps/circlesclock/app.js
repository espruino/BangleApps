const locale = require("locale");
const heatshrink = require("heatshrink");

const shoesIcon = heatshrink.decompress(atob("h0OwYJGgmAAgUBkgECgVJB4cSoAUDyEBkARDpADBhMAyQRBgVAkgmDhIUDAAuQAgY1DAAYA="));
const heartIcon = heatshrink.decompress(atob("h0OwYOLkmQhMkgACByVJgESpIFBpEEBAIFBCgIFCCgsABwcAgQOCAAMSpAwDyBNM"));
const powerIcon = heatshrink.decompress(atob("h0OwYQNsAED7AEDmwEDtu2AgUbtuABwXbBIUN23AAoYOCgEDFIgODABI"));
const powerIconGreen = heatshrink.decompress(atob("h0OwYQNkAEDpAEDiQEDkmSAgUJkmABwVJBIUEyVAAoYOCgEBFIgODABI"));
const powerIconRed = heatshrink.decompress(atob("h0OwYQNoAEDyAEDkgEDpIFDiVJBweSAgUJkmAAoYZDgQpEBwYAJA"));

let settings;
function loadSettings() {
  settings = require("Storage").readJSON("circlesclock.json", 1) || {
    'minHR': 40,
    'maxHR': 200,
    'stepGoal': 10000,
    'batteryWarn': 30,
    'showWidgets': false,
    'circle1': 'hr',
    'circle2': 'steps',
    'circle3': 'battery'
  };
  // Load step goal from pedometer widget as fallback
  if (settings.stepGoal == undefined) {
    const d = require('Storage').readJSON("wpedom.json", 1) || {};
    settings.stepGoal = d != undefined && d.settings != undefined ? d.settings.goal : 10000;
  }
}
loadSettings();
const showWidgets = settings.showWidgets || false;

let hrtValue;

// layout values:
const colorFg = g.theme.dark ? '#fff' : '#000';
const colorBg = g.theme.dark ? '#000' : '#fff';
const colorGrey = '#808080';
const colorRed = '#ff0000';
const colorGreen = '#008000';
const colorBlue = '#0000ff';
const colorYellow = '#ffff00';
const widgetOffset = showWidgets ? 12 : 0;
const h = g.getHeight() - widgetOffset;
const w = g.getWidth();
const hOffset = 30 - widgetOffset;
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

  drawCircle(1, "steps");
  drawCircle(2, "hr");
  drawCircle(3, "battery");
}


function drawCircle(index, defaultType) {
  const type = settings['circle' + index] || defaultType;
  const w = index == 1 ? w1: index == 2 ? w2 : w3;

  switch (type) {
    case "steps":
      drawSteps(w);
      break;
    case "stepsDist":
      drawStepsDistance(w);
      break;
    case "hr":
      drawHeartRate(w);
      break;
    case "battery":
      drawBattery(w);
      break;
  }
}
function getCirclePosition(type, defaultPos) {
  for (let i = 1; i <= 3; i++) {
    const setting = settings['circle' + i];
    if (setting == type) return i;
  }
  return defaultPos;
}

function isCircleEnabled(type) {
  return getCirclePosition(type) != undefined;
}

function drawSteps(w) {
  if (!w) w = getCirclePosition("steps", w1);
  const steps = getSteps();
  g.setColor(colorGrey);
  g.fillCircle(w, h3, radiusOuter);

  const stepGoal = settings.stepGoal || 10000;
  if (stepGoal > 0) {
    let percent = steps / stepGoal;
    if (stepGoal < steps) percent = 1;
    drawGauge(w, h3, percent, colorBlue);
  }

  g.setColor(colorBg);
  g.fillCircle(w, h3, radiusInner);

  g.fillPoly([w, h3, w - 15, h3 + radiusOuter + 5, w + 15, h3 + radiusOuter + 5]);

  g.setFont("Vector:12");
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(shortValue(steps), w + 2, h3);

  g.drawImage(shoesIcon, w - 6, h3 + radiusOuter - 6);
}

function drawStepsDistance(w) {
  if (!w) w = getCirclePosition("steps", w1);
  const steps = getSteps();
  const stepDistance = 0.8; // TODO make configurable
  const stepsDistance = steps * stepDistance;

  g.setColor(colorGrey);
  g.fillCircle(w, h3, radiusOuter);

  const stepDistanceGoal = settings.stepDistanceGoal || 5;
  if (stepDistanceGoal > 0) {
    let percent = stepsDistance / stepDistanceGoal;
    if (stepDistanceGoal < stepsDistance) percent = 1;
    drawGauge(w, h3, percent, colorGreen);
  }

  g.setColor(colorBg);
  g.fillCircle(w, h3, radiusInner);

  g.fillPoly([w, h3, w - 15, h3 + radiusOuter + 5, w + 15, h3 + radiusOuter + 5]);

  g.setFont("Vector:12");
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(shortValue(stepsDistance), w + 2, h3);

  g.drawImage(shoesIcon, w - 6, h3 + radiusOuter - 6);
}

function drawHeartRate(w) {
  if (!w) w = getCirclePosition("hr", w2);
  g.setColor(colorGrey);
  g.fillCircle(w, h3, radiusOuter);

  if (hrtValue != undefined && hrtValue > 0) {
    const minHR = settings.minHR || 40;
    const percent = (hrtValue - minHR) / (settings.maxHR - minHR);
    drawGauge(w, h3, percent, colorRed);
  }

  g.setColor(colorBg);
  g.fillCircle(w, h3, radiusInner);

  g.fillPoly([w, h3, w - 15, h3 + radiusOuter + 5, w + 15, h3 + radiusOuter + 5]);

  g.setFont("Vector:12");
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(hrtValue != undefined ? hrtValue : "-", w, h3);

  g.drawImage(heartIcon, w - 6, h3 + radiusOuter - 6);
}

function drawBattery(w) {
  if (!w) w = getCirclePosition("battery", w3);
  const battery = E.getBattery();
  g.setColor(colorGrey);
  g.fillCircle(w, h3, radiusOuter);

  if (battery > 0) {
    const percent = battery / 100;
    drawGauge(w, h3, percent, colorYellow);
  }

  g.setColor(colorBg);
  g.fillCircle(w, h3, radiusInner);

  g.fillPoly([w, h3, w - 15, h3 + radiusOuter + 5, w + 15, h3 + radiusOuter + 5]);

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
  g.drawString(battery + '%', w, h3);

  g.drawImage(icon, w - 6, h3 + radiusOuter - 6);
}

function radians(a) {
  return a * Math.PI / 180;
}

function drawGauge(cx, cy, percent, color) {
  let offset = 30;
  let end = 300;
  var i = 0;
  var r = radiusInner + 3;

  if (percent <= 0) return;
  if (percent > 1) percent = 1;

  var startrot = -offset;
  var endrot = startrot - ((end - offset) * percent) - 15;

  g.setColor(color);

  const size = 4;
  // draw gauge
  for (i = startrot; i > endrot - size; i -= size) {
    x = cx + r * Math.sin(radians(i));
    y = cy + r * Math.cos(radians(i));
    g.fillCircle(x, y, size);
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
    if (isCircleEnabled("hr")) {
      Bangle.setHRMPower(1, "watch");
      if (hrtValue == undefined) {
        hrtValue = '...';
        drawHeartRate();
      }
    }
  } else {
    if (isCircleEnabled("hr")) {
      Bangle.setHRMPower(0, "watch");
    }
  }
  if (isCircleEnabled("hr")) drawHeartRate();
  if (isCircleEnabled("steps")) drawSteps();
  if (isCircleEnabled("stepsDistance")) drawStepsDistance();
});

Bangle.on('HRM', function(hrm) {
  if (isCircleEnabled("hr")) {
    //if(hrm.confidence > 90){
    hrtValue = hrm.bpm;
    if (Bangle.isLCDOn())
      drawHeartRate();
    //} else {
    //  hrtValue = undefined;
    //}
  }
});

Bangle.on('charging', function(charging) {
  if (isCircleEnabled("battery")) drawBattery();
});

g.clear();


Bangle.loadWidgets();
if (!showWidgets) {
  /*
  * we are not drawing the widgets as we are taking over the whole screen
  * so we will blank out the draw() functions of each widget and change the
  * area to the top bar doesn't get cleared.
  */
  if (WIDGETS && typeof WIDGETS === "object") {
    for (let wd of WIDGETS) {
      wd.draw = () => {};
      wd.area = "";
    }
  }
}


setInterval(draw, 60000);
draw();
Bangle.setUI("clock");
