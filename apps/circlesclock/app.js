const locale = require("locale");
const storage = require("Storage");
const SunCalc = require("https://raw.githubusercontent.com/mourner/suncalc/master/suncalc.js");

const shoesIcon = atob("EBCBAAAACAAcAB4AHgAeABwwADgGeAZ4AHgAMAAAAHAAIAAA");
const heartIcon = atob("EBCBAAAAAAAeeD/8P/x//n/+P/w//B/4D/AH4APAAYAAAAAA");
const powerIcon = atob("FBSBAAAAAAAAAfgAP8AH/gB/4Af+AH/gB/4Af+AH/gB/4Af+AH/gB/4Af+AH/gB/4AAAAAAA");
const temperatureIcon = atob("EBCBAAAAAYADwAJAAkADwAPAA8ADwAfgB+AH4AfgA8ABgAAA");

const weatherCloudy = atob("EBCBAAAAAAAAAAfgD/Af8H/4//7///////9//z/+AAAAAAAA");
const weatherSunny = atob("EBCBAAAAAYAQCBAIA8AH4A/wb/YP8A/gB+ARiBAIAYABgAAA");
const weatherMoon = atob("EBCBAAAAAYAP8B/4P/w//D/8f/5//j/8P/w//B/4D/ABgAAA");
const weatherPartlyCloudy = atob("EBCBAAAAAAAYQAMAD8AIQBhoW+AOYBwwOBBgHGAGP/wf+AAA");
const weatherRainy = atob("EBCBAAAAAYAH4AwwOBBgGEAOQAJBgjPOEkgGYAZgA8ABgAAA");
const weatherPartlyRainy = atob("EBCBAAAAEEAQAAeADMAYaFvoTmAMMDgQIBxhhiGGG9wDwAGA");
const weatherSnowy = atob("EBCBAAAAAAADwAGAEYg73C50BCAEIC50O9wRiAGAA8AAAAAA");
const weatherFoggy = atob("EBCBAAAAAAADwAZgDDA4EGAcQAZAAgAAf74AAAAAd/4AAAAA");
const weatherStormy = atob("EBCBAAAAAYAH4AwwOBBgGEAOQMJAgjmOGcgAgACAAAAAAAAA");

const sunSetDown = atob("EBCBAAAAAAABgAAAAAATyAZoBCB//gAAAAAGYAPAAYAAAAAA");
const sunSetUp = atob("EBCBAAAAAAABgAAAAAATyAZoBCB//gAAAAABgAPABmAAAAAA");

let settings = storage.readJSON("circlesclock.json", 1) || {
  'minHR': 40,
  'maxHR': 200,
  'confidence': 0,
  'stepGoal': 10000,
  'stepDistanceGoal': 8000,
  'stepLength': 0.8,
  'batteryWarn': 30,
  'showWidgets': false,
  'weatherCircleData': 'humidity',
  'circleCount': 3,
  'circle1': 'hr',
  'circle2': 'steps',
  'circle3': 'battery',
  'circle4': 'weather'
};
// Load step goal from pedometer widget as fallback
if (settings.stepGoal == undefined) {
  const d = storage.readJSON("wpedom.json", 1) || {};
  settings.stepGoal = d != undefined && d.settings != undefined ? d.settings.goal : 10000;
}

/*
 * Read location from myLocation app
 */
function getLocation() {
  return storage.readJSON("mylocation.json", 1) || undefined;
}
let location = getLocation();

const showWidgets = settings.showWidgets || false;
const circleCount = settings.circleCount || 3;

let hrtValue;
let now = Math.round(new Date().getTime() / 1000);


// layout values:
const colorFg = g.theme.dark ? '#fff' : '#000';
const colorBg = g.theme.dark ? '#000' : '#fff';
const colorGrey = '#808080';
const colorRed = '#ff0000';
const colorGreen = '#008000';
const colorBlue = '#0000ff';
const colorYellow = '#ffff00';
const widgetOffset = showWidgets ? 24 : 0;
const dowOffset = circleCount == 3 ? 22 : 24; // dow offset relative to date
const h = g.getHeight() - widgetOffset;
const w = g.getWidth();
const hOffset = 30 - widgetOffset;
const h1 = Math.round(1 * h / 5 - hOffset);
const h2 = Math.round(3 * h / 5 - hOffset);
const h3 = Math.round(8 * h / 8 - hOffset - 3); // circle y position

/*
 * circle x positions
 * depending on circleCount
 *
 * | 1 2 3 4 5 6 |
 * | (1) (2) (3) |
 * => circles start at 1,3,5 / 6
 *
 * | 1 2 3 4 5 6 7 8 |
 * | (1) (2) (3) (4) |
 * => circles start at 1,3,5,7 / 8
 */
const parts = circleCount * 2;
const circlePosX = [
  Math.round(1 * w / parts), // circle1
  Math.round(3 * w / parts), // circle2
  Math.round(5 * w / parts), // circle3
  Math.round(7 * w / parts), // circle4
];

const radiusOuter = circleCount == 3 ? 25 : 19;
const radiusInner = circleCount == 3 ? 20 : 15;
const circleFontSmall = circleCount == 3 ? "Vector:14" : "Vector:10";
const circleFont = circleCount == 3 ? "Vector:15" : "Vector:11";
const circleFontBig = circleCount == 3 ? "Vector:16" : "Vector:12";
const iconOffset = circleCount == 3 ? 6 : 8;
const defaultCircleTypes = ["steps", "hr", "battery", "weather"];


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
  g.fillRect(0, widgetOffset, w, h2 + 22);

  // time
  g.setFont("Vector:50");
  g.setFontAlign(0, -1);
  g.setColor(colorFg);
  g.drawString(locale.time(new Date(), 1), w / 2, h1 + 8);
  now = Math.round(new Date().getTime() / 1000);

  // date & dow
  g.setFont("Vector:21");
  g.setFontAlign(-1, 0);
  g.drawString(locale.date(new Date()), w > 180 ? 2 * w / 10 : w / 10, h2);
  g.drawString(locale.dow(new Date()), w > 180 ? 2 * w / 10 : w / 10, h2 + dowOffset);

  drawCircle(1);
  drawCircle(2);
  drawCircle(3);
  if (circleCount >= 4) drawCircle(4);
}

function drawCircle(index) {
  let type = settings['circle' + index];
  if (!type) type = defaultCircleTypes[index - 1];
  const w = getCircleXPosition(type);

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
    case "sunprogress":
    case "sunProgress":
      drawSunProgress(w);
      break;
    case "temperature":
      drawTemperature(w);
      break;
    case "pressure":
      drawPressure(w);
      break;
    case "altitude":
      drawAltitude(w);
      break;
    case "empty":
      // we draw nothing here
      return;
  }
}

// serves as cache for quicker lookup of circle positions
let circlePositionsCache = [];
/*
 * Looks in the following order if a circle with the given type is somewhere visible/configured
 * 1. circlePositionsCache
 * 2. settings
 * 3. defaultCircleTypes
 *
 * In case 2 and 3 the circlePositionsCache will be updated
 */
function getCirclePosition(type) {
  if (circlePositionsCache[type] >= 0) {
    return circlePositionsCache[type];
  }
  for (let i = 1; i <= circleCount; i++) {
    const setting = settings['circle' + i];
    if (setting == type) {
      circlePositionsCache[type] = i - 1;
      return i - 1;
    }
  }
  for (let i = 0; i < defaultCircleTypes.length; i++) {
    if (type == defaultCircleTypes[i] && (!settings || settings['circle' + (i + 1)] == undefined)) {
      circlePositionsCache[type] = i;
      return i;
    }
  }
  return undefined;
}

function getCircleXPosition(type) {
  const circlePos = getCirclePosition(type);
  if (circlePos != undefined) {
    return circlePosX[circlePos];
  }
  return undefined;
}

function isCircleEnabled(type) {
  return getCirclePosition(type) != undefined;
}

function getCircleColor(type) {
  const pos = getCirclePosition(type);
  const color = settings["circle" + (pos + 1) + "color"];
  if (color && color != "") return color;
}

function getCircleIconColor(type, color) {
  const pos = getCirclePosition(type);
  const colorizeIcon = settings["circle" + (pos + 1) + "colorizeIcon"] == true;
  if (colorizeIcon) {
    return color;
  } else {
    return "";
  }
}

function getImage(graphic, color) {
  if (!color || color == "") {
    return graphic;
  } else {
    return {
      width: 16,
      height: 16,
      bpp: 1,
      transparent: 0,
      buffer: E.toArrayBuffer(graphic),
      palette: new Uint16Array([colorBg, g.toColor(color)])
    };
  }
}

function drawSteps(w) {
  if (!w) w = getCircleXPosition("steps");
  const steps = getSteps();

  drawCircleBackground(w);

  const color = getCircleColor("steps") || colorBlue;

  const stepGoal = settings.stepGoal || 10000;
  if (stepGoal > 0) {
    let percent = steps / stepGoal;
    if (stepGoal < steps) percent = 1;
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, shortValue(steps));

  g.drawImage(getImage(shoesIcon, getCircleIconColor("steps", color)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawStepsDistance(w) {
  if (!w) w = getCircleXPosition("stepsDistance");
  const steps = getSteps();
  const stepDistance = settings.stepLength || 0.8;
  const stepsDistance = Math.round(steps * stepDistance);

  drawCircleBackground(w);

  const color = getCircleColor("stepsDistance") || colorGreen;

  const stepDistanceGoal = settings.stepDistanceGoal || 8000;
  if (stepDistanceGoal > 0) {
    let percent = stepsDistance / stepDistanceGoal;
    if (stepDistanceGoal < stepsDistance) percent = 1;
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, shortValue(stepsDistance));

  g.drawImage(getImage(shoesIcon, getCircleIconColor("stepsDistance", color)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawHeartRate(w) {
  if (!w) w = getCircleXPosition("hr");

  drawCircleBackground(w);

  const color = getCircleColor("hr") || colorRed;

  if (hrtValue != undefined) {
    const minHR = settings.minHR || 40;
    const maxHR = settings.maxHR || 200;
    const percent = (hrtValue - minHR) / (maxHR - minHR);
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, hrtValue != undefined ? hrtValue : "-");

  g.drawImage(getImage(heartIcon, getCircleIconColor("hr", color)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawBattery(w) {
  if (!w) w = getCircleXPosition("battery");
  const battery = E.getBattery();

  drawCircleBackground(w);

  let color = getCircleColor("battery") || colorYellow;

  if (battery > 0) {
    const percent = battery / 100;
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  if (Bangle.isCharging()) {
    color = colorGreen;
  } else {
    if (settings.batteryWarn != undefined && battery <= settings.batteryWarn) {
      color = colorRed;
    }
  }
  writeCircleText(w, battery + '%');

  g.drawImage(getImage(powerIcon, getCircleIconColor("battery", color)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawWeather(w) {
  if (!w) w = getCircleXPosition("weather");
  const weather = getWeather();
  const tempString = weather ? locale.temp(weather.temp - 273.15) : undefined;
  const code = weather ? weather.code : -1;

  drawCircleBackground(w);

  const color = getCircleColor("weather") || colorYellow;

  const data = settings.weatherCircleData || "humidity";
  switch (data) {
    case "humidity":
      const humidity = weather ? weather.hum : undefined;
      if (humidity >= 0) {
        drawGauge(w, h3, humidity / 100, color);
      }
      break;
    case "wind":
      if (weather) {
        const wind = locale.speed(weather.wind).match(/^(\D*\d*)(.*)$/);
        if (wind[1] >= 0) {
          if (wind[2] == "kmh") {
            wind[1] = windAsBeaufort(wind[1]);
          }
          // wind goes from 0 to 12 (see https://en.wikipedia.org/wiki/Beaufort_scale)
          drawGauge(w, h3, wind[1] / 12, color);
        }
      }
      break;
    case "empty":
      break;
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, tempString ? tempString : "?");

  if (code > 0) {
    const icon = getWeatherIconByCode(code);
    if (icon) g.drawImage(getImage(icon, getCircleIconColor("weather", color)), w - iconOffset, h3 + radiusOuter - iconOffset);
  } else {
    g.drawString("?", w, h3 + radiusOuter);
  }
}


function drawSunProgress(w) {
  if (!w) w = getCircleXPosition("sunprogress");
  const percent = getSunProgress();

  drawCircleBackground(w);

  const color = getCircleColor("sunpgrogress") || colorYellow;

  drawGauge(w, h3, percent, color);

  drawInnerCircleAndTriangle(w);

  let icon = sunSetDown;
  if (isDay()) {
    // day
    icon = sunSetDown;
  } else {
    // night
    icon = sunSetUp;
  }

  let text = "?";
  const times = getSunData();
  if (times != undefined) {
    const sunRise = Math.round(times.sunrise.getTime() / 1000);
    const sunSet = Math.round(times.sunset.getTime() / 1000);
    if (!isDay()) {
      // night
      if (now > sunRise) {
        // after sunRise
        const upcomingSunRise = sunRise + 60 * 60 * 24;
        text = formatSeconds(upcomingSunRise - now);
      } else {
        text = formatSeconds(sunRise - now);
      }
    } else {
      // day, approx sunrise tomorrow:
      text = formatSeconds(sunSet - now);
    }
  }

  writeCircleText(w, text);

  g.drawImage(getImage(icon, getCircleIconColor("sunprogress", color)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawTemperature(w) {
  if (!w) w = getCircleXPosition("temperature");

  getPressureValue("temperature").then((temperature) => {
    drawCircleBackground(w);

    const color = getCircleColor("temperature") || colorGreen;

    drawInnerCircleAndTriangle(w);

    if (temperature) {
      const min = -40;
      const max = 85;
      const percent = (temperature - min) / (max - min);
      drawGauge(w, h3, percent, color);
    }

    if (temperature)
      writeCircleText(w, locale.temp(temperature));

    g.drawImage(getImage(temperatureIcon, getCircleIconColor("temperature", color)), w - iconOffset, h3 + radiusOuter - iconOffset);

  }).catch(() => {
    setTimeout(() => {
      drawTemperature();
    }, 1000);
  });
}

function drawPressure(w) {
  if (!w) w = getCircleXPosition("pressure");

  getPressureValue("pressure").then((pressure) => {
    drawCircleBackground(w);

    const color = getCircleColor("pressure") || colorGreen;

    drawInnerCircleAndTriangle(w);

    if (pressure && pressure > 0) {
      const minPressure = 950;
      const maxPressure = 1050;
      const percent = (pressure - minPressure) / (maxPressure - minPressure);
      drawGauge(w, h3, percent, color);
    }

    if (pressure)
      writeCircleText(w, Math.round(pressure));

    g.drawImage(getImage(temperatureIcon, getCircleIconColor("pressure", color)), w - iconOffset, h3 + radiusOuter - iconOffset);

  }).catch(() => {
    setTimeout(() => {
      drawPressure(w);
    }, 1000);
  });
}

function drawAltitude(w) {
  if (!w) w = getCircleXPosition("altitude");

  getPressureValue("altitude").then((altitude) => {
    drawCircleBackground(w);

    const color = getCircleColor("altitude") || colorGreen;

    drawInnerCircleAndTriangle(w);

    if (altitude) {
      const min = 0;
      const max = 10000;
      const percent = (altitude - min) / (max - min);
      drawGauge(w, h3, percent, color);
    }

    if (altitude)
      writeCircleText(w, locale.distance(Math.round(altitude)));

    g.drawImage(getImage(temperatureIcon, getCircleIconColor("altitude", color)), w - iconOffset, h3 + radiusOuter - iconOffset);

  }).catch(() => {
    setTimeout(() => {
      drawAltitude(w);
    }, 1000);
  });
}

/*
 * wind goes from 0 to 12 (see https://en.wikipedia.org/wiki/Beaufort_scale)
 */
function windAsBeaufort(windInKmh) {
  const beaufort = [2, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  let l = 0;
  while (l < beaufort.length && beaufort[l] < windInKmh) {
    l++;
  }
  return l;
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
          return isDay() ? weatherSunny : weatherMoon;
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


function isDay() {
  const times = getSunData();
  if (times == undefined) return true;
  const sunRise = Math.round(times.sunrise.getTime() / 1000);
  const sunSet = Math.round(times.sunset.getTime() / 1000);

  return (now > sunRise && now < sunSet);
}

function formatSeconds(s) {
  if (s > 60 * 60) { // hours
    return Math.round(s / (60 * 60)) + "h";
  }
  if (s > 60) { // minutes
    return Math.round(s / 60) + "m";
  }
  return "<1m";
}

function getSunData() {
  if (location != undefined && location.lat != undefined) {
    // get today's sunlight times for lat/lon
    return SunCalc ? SunCalc.getTimes(new Date(), location.lat, location.lon) : undefined;
  }
  return undefined;
}

/*
 * Calculated progress of the sun between sunrise and sunset in percent
 *
 * Taken from rebble app and modified
 */
function getSunProgress() {
  const times = getSunData();
  if (times == undefined) return 0;
  const sunRise = Math.round(times.sunrise.getTime() / 1000);
  const sunSet = Math.round(times.sunset.getTime() / 1000);

  if (isDay()) {
    // during day
    const dayLength = sunSet - sunRise;
    if (now > sunRise) {
      return (now - sunRise) / dayLength;
    } else {
      return (sunRise - now) / dayLength;
    }
  } else {
    // during night
    if (now < sunRise) {
      const prevSunSet = sunSet - 60 * 60 * 24;
      return 1 - (sunRise - now) / (sunRise - prevSunSet);
    } else {
      const upcomingSunRise = sunRise + 60 * 60 * 24;
      return (upcomingSunRise - now) / (upcomingSunRise - sunSet);
    }
  }
}

/*
 * Draws the background and the grey circle
 */
function drawCircleBackground(w) {
  g.clearRect(w - radiusOuter - 3, h3 - radiusOuter - 3, w + radiusOuter + 3, h3 + radiusOuter + 3);
  // Draw rectangle background:
  g.setColor(colorBg);
  g.fillRect(w - radiusOuter - 3, h3 - radiusOuter - 3, w + radiusOuter + 3, h3 + radiusOuter + 3);
  // Draw grey background circle:
  g.setColor(colorGrey);
  g.fillCircle(w, h3, radiusOuter);
}

function drawInnerCircleAndTriangle(w) {
  // Draw inner circle
  g.setColor(colorBg);
  g.fillCircle(w, h3, radiusInner);
  // Draw triangle which covers the bottom of the circle
  g.fillPoly([w, h3, w - 15, h3 + radiusOuter + 5, w + 15, h3 + radiusOuter + 5]);
}

function radians(a) {
  return a * Math.PI / 180;
}

/*
 * This draws the actual gauge consisting out of lots of little filled circles
 */
function drawGauge(cx, cy, percent, color) {
  const offset = 15;
  const end = 360 - offset;
  const radius = radiusInner + (circleCount == 3 ? 3 : 2);
  const size = radiusOuter - radiusInner - 2;

  if (percent <= 0) return;
  if (percent > 1) percent = 1;

  const startRotation = -offset;
  const endRotation = startRotation - ((end - offset) * percent);

  g.setColor(color);

  for (let i = startRotation; i > endRotation - size; i -= size) {
    x = cx + radius * Math.sin(radians(i));
    y = cy + radius * Math.cos(radians(i));
    g.fillCircle(x, y, size);
  }
}

function writeCircleText(w, content) {
  if (content == undefined) return;
  const font = String(content).length > 4 ? circleFontSmall : String(content).length > 3 ? circleFont : circleFontBig;
  g.setFont(font);

  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(content, w, h3);
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
  if (Bangle.getHealthStatus) {
    return Bangle.getHealthStatus("day").steps;
  }
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

let pressureLocked = false;
let pressureCache;

function getPressureValue(type) {
  return new Promise((resolve, reject) => {
    if (Bangle.getPressure) {
      if (!pressureLocked) {
        pressureLocked = true;
        if (pressureCache && pressureCache[type]) {
          resolve(pressureCache[type]);
        } else {
          reject();
        }
        Bangle.getPressure().then(function(d) {
          pressureLocked = false;
          if (d) {
            pressureCache = d;
            if (d[type]) {
              resolve(d[type]);
            }
          } else {
            reject();
          }
        }).catch(reject);
      } else {
        if (pressureCache && pressureCache[type]) {
          resolve(pressureCache[type]);
        } else {
          reject();
        }
      }
    } else {
      reject();
    }
  });
}

Bangle.on('lock', function(isLocked) {
  if (!isLocked) {
    draw();
    if (isCircleEnabled("hr")) {
      enableHRMSensor();
    }
  } else {
    Bangle.setHRMPower(0, "circleclock");
  }
});


Bangle.on('HRM', function(hrm) {
  if (isCircleEnabled("hr")) {
    if (hrm.confidence >= (settings.confidence || 0)) {
      hrtValue = hrm.bpm;
      if (Bangle.isLCDOn())
        drawHeartRate();
    }
  }
});

Bangle.on('charging', function(charging) {
  if (isCircleEnabled("battery")) drawBattery();
});

if (isCircleEnabled("hr")) {
  enableHRMSensor();
}


Bangle.setUI("clock");
Bangle.loadWidgets();

draw();
setInterval(draw, 60000);
