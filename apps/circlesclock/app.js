const locale = require("locale");
const heatshrink = require("heatshrink");
const storage = require("Storage");

const shoesIcon = heatshrink.decompress(atob("h0OwYJGgmAAgUBkgECgVJB4cSoAUDyEBkARDpADBhMAyQRBgVAkgmDhIUDAAuQAgY1DAAYA="));
const shoesIconGreen = heatshrink.decompress(atob("h0OwYJGhIEDgVIAgUEyQKDkmACgcggVACIeQAYMSgIRCgmApIbDiQUDAAkBkAFDGoYAD"));
const heartIcon = heatshrink.decompress(atob("h0OwYOLkmQhMkgACByVJgESpIFBpEEBAIFBCgIFCCgsABwcAgQOCAAMSpAwDyBNM"));
const powerIcon = heatshrink.decompress(atob("h0OwYQNsAED7AEDmwEDtu2AgUbtuABwXbBIUN23AAoYOCgEDFIgODABI"));
const powerIconGreen = heatshrink.decompress(atob("h0OwYQNkAEDpAEDiQEDkmSAgUJkmABwVJBIUEyVAAoYOCgEBFIgODABI"));
const powerIconRed = heatshrink.decompress(atob("h0OwYQNoAEDyAEDkgEDpIFDiVJBweSAgUJkmAAoYZDgQpEBwYAJA"));

const weatherCloudy = heatshrink.decompress(atob("iEQwYWTgP//+AAoMPAoPwAoN/AocfAgP//0AAgQAB/AFEABgdDAAMDDohMRA"));
const weatherSunny = heatshrink.decompress(atob("iEQwYLIg3AAgVgAQMMAo8Am3YAgUB23bAoUNAoIUBjYFCsOwBYoFDDpFgHYI1JI4gFGAAYA="));
const weatherPartlyCloudy = heatshrink.decompress(atob("iEQwYQNv0AjgGDn4EDh///gFChwREC4MfxwIBv0//+AC4X4j4FCv/AgfwgED/wIBuAaBBwgFDgP4gf/AAXABwIEBDQQAEA=="));
const weatherRainy = heatshrink.decompress(atob("iEQwYLIg/gAgUB///wAFBh/AgfwgED/wIBuEAj4OCv0AjgaCh/4AocAnAFBFIU4EAM//gRBEAIOBhw1C/AmDAosAC4JNIAAg"));
const weatherPartlyRainy = heatshrink.decompress(atob("h0OwYJGjkAnAFCj+AAgU//4FCuEA8EAg8ch/4gEB4////AAoIIBCIMD/wgCg4bBg/8BwMD+AgBh4ZBDQf/FIIABh4IBgAA=="));
const weatherSnowy = heatshrink.decompress(atob("iEQwYROn/8AocH8AECuAFBh0Agf+CIN/4EDx/4j/x4EAgIIBwAXBAogRFDoopFGoxBGABIA="));
const weatherFoggy = heatshrink.decompress(atob("iEQwYROn/8AgUB/EfwAFBh/AgfwgED/wIBuEABwd/4EcDQgFDgE4Fosf///8f//A/Lj/xCQIRNA="));
const weatherStormy = heatshrink.decompress(atob("iEQwYLIg/gAgUB///wAFBh/AgfwgED/wIBuEAj4OCv0AjgaCh/4AoX8gE4AoQpBnAdBF4IRBDQMH/kOHgY7DAo4AOA=="));

let settings;

function loadSettings() {
  settings = storage.readJSON("circlesclock.json", 1) || {
    'minHR': 40,
    'maxHR': 200,
    'stepGoal': 10000,
    'stepDistanceGoal': 8000,
    'stepLength': 0.8,
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
const widgetOffset = showWidgets ? 24 : 0;
const h = g.getHeight() - widgetOffset;
const w = g.getWidth();
const hOffset = 30 - widgetOffset;
const h1 = Math.round(1 * h / 5 - hOffset);
const h2 = Math.round(3 * h / 5 - hOffset);
const h3 = Math.round(8 * h / 8 - hOffset - 3); // circle y position
const circlePosX = [Math.round(w / 6), Math.round(3 * w / 6), Math.round(5 * w / 6)]; // cirle x positions
const radiusOuter = 25;
const radiusInner = 20;
const circleFont = "Vector:15";
const circleFontBig = "Vector:16";
const circleFontSmall = "Vector:13";

function draw() {
  g.clear(true);

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
  } else {
    Bangle.drawWidgets();
  }

  g.setColor(colorBg);
  g.fillRect(0, widgetOffset, w, h);

  // time
  g.setFont("Vector:50");
  g.setFontAlign(0, -1);
  g.setColor(colorFg);
  g.drawString(locale.time(new Date(), 1), w / 2, h1 + 8);

  // date & dow
  g.setFont("Vector:21");
  g.setFontAlign(-1, 0);
  g.drawString(locale.date(new Date()), w > 180 ? 2 * w / 10 : w / 10, h2);
  g.drawString(locale.dow(new Date()), w > 180 ? 2 * w / 10 : w / 10, h2 + 22);

  drawCircle(1);
  drawCircle(2);
  drawCircle(3);
}

const defaultCircleTypes = ["steps", "hr", "battery"];

function drawCircle(index) {
  let type = settings['circle' + index];
  if (!type) type = defaultCircleTypes[index - 1];
  const w = getCirclePosition(type);
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
    case "weather":
      drawWeather(w);
      break;
  }
}

function getCirclePosition(type) {
  for (let i = 1; i <= 3; i++) {
    const setting = settings['circle' + i];
    if (setting == type) return circlePosX[i - 1];
  }
  for (let i = 0; i < defaultCircleTypes.length; i++) {
    if (type == defaultCircleTypes[i]) return circlePosX[i];
  }
  return undefined;
}

function isCircleEnabled(type) {
  return getCirclePosition(type) != undefined;
}

function drawSteps(w) {
  if (!w) w = getCirclePosition("steps");
  const steps = getSteps();

  // Draw rectangle background:
  g.setColor(colorBg);
  g.fillRect(w - radiusOuter - 3, h3 - radiusOuter - 3, w + radiusOuter + 3, h3 + radiusOuter + 3);

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

  g.setFont(circleFont);
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(shortValue(steps), w + 2, h3);

  g.drawImage(shoesIcon, w - 6, h3 + radiusOuter - 6);
}

function drawStepsDistance(w) {
  if (!w) w = getCirclePosition("steps");
  const steps = getSteps();
  const stepDistance = settings.stepLength || 0.8;
  const stepsDistance = Math.round(steps * stepDistance);

  // Draw rectangle background:
  g.setColor(colorBg);
  g.fillRect(w - radiusOuter - 3, h3 - radiusOuter - 3, w + radiusOuter + 3, h3 + radiusOuter + 3);

  g.setColor(colorGrey);
  g.fillCircle(w, h3, radiusOuter);

  const stepDistanceGoal = settings.stepDistanceGoal || 8000;
  if (stepDistanceGoal > 0) {
    let percent = stepsDistance / stepDistanceGoal;
    if (stepDistanceGoal < stepsDistance) percent = 1;
    drawGauge(w, h3, percent, colorGreen);
  }

  g.setColor(colorBg);
  g.fillCircle(w, h3, radiusInner);

  g.fillPoly([w, h3, w - 15, h3 + radiusOuter + 5, w + 15, h3 + radiusOuter + 5]);

  g.setFont(circleFont);
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(shortValue(stepsDistance), w + 2, h3);

  g.drawImage(shoesIconGreen, w - 6, h3 + radiusOuter - 6);
}

function drawHeartRate(w) {
  if (!w) w = getCirclePosition("hr");

  // Draw rectangle background:
  g.setColor(colorBg);
  g.fillRect(w - radiusOuter - 3, h3 - radiusOuter - 3, w + radiusOuter + 3, h3 + radiusOuter + 3);

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

  g.setFont(circleFontBig);
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(hrtValue != undefined ? hrtValue : "-", w, h3);

  g.drawImage(heartIcon, w - 6, h3 + radiusOuter - 6);
}

function drawBattery(w) {
  if (!w) w = getCirclePosition("battery");
  const battery = E.getBattery();

  // Draw rectangle background:
  g.setColor(colorBg);
  g.fillRect(w - radiusOuter - 3, h3 - radiusOuter - 3, w + radiusOuter + 3, h3 + radiusOuter + 3);

  g.setColor(colorGrey);
  g.fillCircle(w, h3, radiusOuter);

  if (battery > 0) {
    const percent = battery / 100;
    drawGauge(w, h3, percent, colorYellow);
  }

  g.setColor(colorBg);
  g.fillCircle(w, h3, radiusInner);

  g.fillPoly([w, h3, w - 15, h3 + radiusOuter + 5, w + 15, h3 + radiusOuter + 5]);

  g.setFont(circleFont);
  g.setFontAlign(0, 0);

  let icon = powerIcon;
  let color = colorFg;
  if (Bangle.isCharging()) {
    color = colorGreen;
    icon = powerIconGreen;
  } else {
    if (settings.batteryWarn != undefined && battery <= settings.batteryWarn) {
      color = colorRed;
      icon = powerIconRed;
    }
  }
  g.setColor(color);
  g.drawString(battery + '%', w, h3);

  g.drawImage(icon, w - 6, h3 + radiusOuter - 6);
}

function drawWeather(w) {
  if (!w) w = getCirclePosition("weather");
  const weather = getWeather();
  const tempString = weather ? locale.temp(weather.temp - 273.15) : undefined;
  const humidity = weather ? weather.hum : undefined;
  const code = weather ? weather.code : -1;

  // Draw rectangle background:
  g.setColor(colorBg);
  g.fillRect(w - radiusOuter - 3, h3 - radiusOuter - 3, w + radiusOuter + 3, h3 + radiusOuter + 3);

  g.setColor(colorGrey);
  g.fillCircle(w, h3, radiusOuter);

  if (humidity >= 0) {
    drawGauge(w, h3, humidity / 100, colorYellow);
  }

  g.setColor(colorBg);
  g.fillCircle(w, h3, radiusInner);

  g.fillPoly([w, h3, w - 25, h3 + radiusOuter + 5, w + 25, h3 + radiusOuter + 5]);

  const content = tempString ? tempString : "?";
  g.setFont(content.length < 4 ? circleFont : circleFontSmall);
  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(content, w, h3);

  if (code > 0) {
    const icon = getWeatherIconByCode(code);
    if (icon) g.drawImage(icon, w - 6, h3 + radiusOuter - 10);
  }
}

/*
 * Choose weather icon to display based on weather conditition code
 * https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
 */
function getWeatherIconByCode(code) {
  const codeGroup = Math.round(code / 100);
  switch (codeGroup) {
    case 2:
      return weatherStormy;
    case 3:
      return weatherCloudy;
    case 5:
      switch (code) {
        case 511:
          return weatherSnowy;
        case 520:
          return weatherPartlyRainy;
        case 521:
          return weatherPartlyRainy;
        case 522:
          return weatherPartlyRainy;
        case 531:
          return weatherPartlyRainy;
        default:
          return weatherRainy;
      }
      break;
    case 6:
      return weatherSnowy;
    case 7:
      return weatherFoggy;
    case 8:
      switch (code) {
        case 800:
          return weatherSunny;
        case 801:
          return weatherPartlyCloudy;
        case 802:
          return weatherPartlyCloudy;
        default:
          return weatherCloudy;
      }
      break;
    default:
      return undefined;
  }
  return undefined;
}

function radians(a) {
  return a * Math.PI / 180;
}

function drawGauge(cx, cy, percent, color) {
  const offset = 15;
  const end = 345;
  const r = radiusInner + 3;

  if (percent <= 0) return;
  if (percent > 1) percent = 1;

  const startrot = -offset;
  const endrot = startrot - ((end - offset) * percent);

  g.setColor(color);

  const size = radiusOuter - radiusInner - 2;
  // draw gauge
  for (let i = startrot; i > endrot - size; i -= size) {
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
  if (WIDGETS && WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom.getSteps();
  }
  return 0;
}

function getWeather() {
  const jsonWeather = storage.readJSON('weather.json');
  return jsonWeather && jsonWeather.weather ? jsonWeather.weather : undefined;
}

function enableHRMSensor() {
  Bangle.setHRMPower(1, "circleclock");
  if (hrtValue == undefined) {
    hrtValue = '...';
    drawHeartRate();
  }
}

Bangle.on('lock', function(isLocked) {
  if (!isLocked) {
    if (isCircleEnabled("hr")) {
      enableHRMSensor();
    }
    draw();
  } else {
    Bangle.setHRMPower(0, "circleclock");
  }
});


Bangle.on('HRM', function(hrm) {
  if (isCircleEnabled("hr")) {
    hrtValue = hrm.bpm;
    if (Bangle.isLCDOn())
      drawHeartRate();
  }
});


Bangle.setUI("clock");
Bangle.loadWidgets();

draw();
setInterval(draw, 60000);

Bangle.on('charging', function(charging) {
  if (isCircleEnabled("battery")) drawBattery();
});

if (isCircleEnabled("hr")) {
  enableHRMSensor();
}
