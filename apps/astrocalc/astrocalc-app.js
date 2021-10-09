/**
 * BangleJS ASTROCALC
 *
 * Inspired by: https://www.timeanddate.com
 *
 * Original Author: Paul Cockrell https://github.com/paulcockrell
 * Created: April 2020
 *
 * Calculate the Sun and Moon positions based on watch GPS and display graphically
 */

const SunCalc = require("suncalc.js");
const storage = require("Storage");
const LAST_GPS_FILE = "astrocalc.gps.json";
let lastGPS = (storage.readJSON(LAST_GPS_FILE, 1) || null);

function drawMoon(phase, x, y) {
  const moonImgFiles = [
    "new",
    "waxing-crescent",
    "first-quarter",
    "waxing-gibbous",
    "full",
    "waning-gibbous",
    "last-quarter",
    "waning-crescent",
  ];

  img = require("Storage").read(`${moonImgFiles[phase]}.img`);
  // image width & height = 92px
  g.drawImage(img, x - parseInt(92 / 2), y);
}

// linear interpolation between two values a and b
// u controls amount of a/b and is in range [0.0,1.0]
function lerp(a,b,u) {
  return (1-u) * a + u * b;
}

function titlizeKey(key) {
  return (key[0].toUpperCase() + key.slice(1)).match(/[A-Z][a-z]+/g).join(" ");
}

function dateToTimeString(date) {
  const hrs = ("0" + date.getHours()).substr(-2);
  const mins = ("0" + date.getMinutes()).substr(-2);
  const secs = ("0" + date.getMinutes()).substr(-2);

  return `${hrs}:${mins}:${secs}`;
}

function drawTitle(key) {
  const fontHeight = 16;
  const x = 0;
  const x2 = g.getWidth() - 1;
  const y = fontHeight + 26;
  const y2 = g.getHeight() - 1;
  const title = titlizeKey(key);

  g.setFont("6x8", 2);
  g.setFontAlign(0,-1);
  g.drawString(title,(x+x2)/2,y-fontHeight-2);
  g.drawLine(x,y-2,x2,y-2);
}

/**
 * @params {Number} angle Angle of point around a radius
 * @params {Number} radius Radius of the point to be drawn, default 2
 * @params {Object} color Color of the point
 * @params {Number} color.r Red 0-1
 * @params {Number} color.g Green 0-1
 * @params {Number} color.b Blue 0-1
 */
function drawPoint(angle, radius, color) {
  const pRad = Math.PI / 180;
  const faceWidth = 80; // watch face radius
  const centerPx = g.getWidth() / 2;

  const a = angle * pRad;
  const x = centerPx + Math.sin(a) * faceWidth;
  const y = centerPx - Math.cos(a) * faceWidth;

  if (!radius) radius = 2;

  g.setColor(color.r, color.g, color.b);
  g.fillCircle(x, y + 20, radius);
}

function drawPoints() {
  const startColor = {r: 140, g: 255, b: 255};  // light blue
  const endColor   = {r: 0, g: 0, b: 140};  // dark turquoise

  const steps = 60;
  const step_u = 1.0 / (steps / 2);
  let u = 0.0;

  for (let i = 0; i < steps; i++) {
    const colR = lerp(startColor.r, endColor.r, u) / 255;
    const colG = lerp(startColor.g, endColor.g, u) / 255;
    const colB = lerp(startColor.b, endColor.b, u) / 255;
    const col = {r: colR, g: colG, b: colB};

    if (i >= 0 && i <= 30) {
      u += step_u;
    } else {
      u -= step_u;
    }

    drawPoint((360 * i) / steps, 2, col);
  }
}

function drawData(title, obj, startX, startY) {
  g.clear();
  drawTitle(title);

  let xPos, yPos;

  if (typeof(startX) === "undefined" || startX === null) {
    // Center text
    g.setFontAlign(0,-1);
    xPos = (0 + g.getWidth() - 2) / 2;
  } else {
    xPos = startX;
  }

  if (typeof(startY) === "undefined") {
    yPos = 5;
  } else {
    yPos = startY;
  }

  g.setFont("6x8", 1);

  Object.keys(obj).forEach((key) => {
    g.drawString(`${key}: ${obj[key]}`, xPos, yPos += 20);
  });

  g.flip();
}

function drawMoonPositionPage(gps, title) {
  const pos = SunCalc.getMoonPosition(new Date(), gps.lat, gps.lon);

  const pageData = {
    Azimuth: pos.azimuth.toFixed(2),
    Altitude: pos.altitude.toFixed(2),
    Distance: `${pos.distance.toFixed(0)} km`,
    "Parallactic Ang": pos.parallacticAngle.toFixed(2),
  };
  const azimuthDegrees = parseInt(pos.azimuth * 180 / Math.PI);

  drawData(title, pageData, null, 80);
  drawPoints();
  drawPoint(azimuthDegrees, 8, {r: 1, g: 1, b: 1});

  let m = setWatch(() => {
    let m = moonIndexPageMenu(gps);
  }, BTN3, {repeat: false, edge: "falling"});
}

function drawMoonIlluminationPage(gps, title) {
  const phaseNames = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quater", "Waning Crescent",
  ];

  const phase = SunCalc.getMoonIllumination(new Date());
  const pageData = {
    Phase: phaseNames[phase.phase],
  };

  drawData(title, pageData, null, 35);
  drawMoon(phase.phase, g.getWidth() / 2, g.getHeight() / 2);

  let m = setWatch(() => {
    let m = moonIndexPageMenu(gps);
  }, BTN3, {repease: false, edge: "falling"});
}


function drawMoonTimesPage(gps, title) {
  const times = SunCalc.getMoonTimes(new Date(), gps.lat, gps.lon);

  const pageData = {
    Rise: dateToTimeString(times.rise),
    Set: dateToTimeString(times.set),
  };

  drawData(title, pageData, null, 105);
  drawPoints();

  // Draw the moon rise position
  const risePos = SunCalc.getMoonPosition(times.rise, gps.lat, gps.lon);
  const riseAzimuthDegrees = parseInt(risePos.azimuth * 180 / Math.PI);
  drawPoint(riseAzimuthDegrees, 8, {r: 1, g: 1, b: 1});

  // Draw the moon set position
  const setPos = SunCalc.getMoonPosition(times.set, gps.lat, gps.lon);
  const setAzimuthDegrees = parseInt(setPos.azimuth * 180 / Math.PI);
  drawPoint(setAzimuthDegrees, 8, {r: 1, g: 1, b: 1});

  let m = setWatch(() => {
    let m = moonIndexPageMenu(gps);
  }, BTN3, {repease: false, edge: "falling"});
}

function drawSunShowPage(gps, key, date) {
  const pos = SunCalc.getPosition(date, gps.lat, gps.lon);

  const hrs = ("0" + date.getHours()).substr(-2);
  const mins = ("0" + date.getMinutes()).substr(-2);
  const secs = ("0" + date.getMinutes()).substr(-2);
  const time = `${hrs}:${mins}:${secs}`;

  const azimuth = Number(pos.azimuth.toFixed(2));
  const azimuthDegrees = parseInt(pos.azimuth * 180 / Math.PI);
  const altitude = Number(pos.altitude.toFixed(2));

  const pageData = {
    Time: time,
    Altitude: altitude,
    Azimumth: azimuth,
    Degrees: azimuthDegrees
  };

  drawData(key, pageData, null, 85);

  drawPoints();

  // Draw the suns position
  drawPoint(azimuthDegrees, 8, {r: 1, g: 1, b: 0});

  m = setWatch(() => {
    m = sunIndexPageMenu(gps);
  }, BTN3, {repeat: false, edge: "falling"});

  return null;
}

function sunIndexPageMenu(gps) {
  const sunTimes = SunCalc.getTimes(new Date(), gps.lat, gps.lon);

  const sunMenu = {
    "": {
      "title": "-- Sun --",
    },
    "Current Pos": () => {
      m = E.showMenu();
      drawSunShowPage(gps, "Current Pos", new Date());
    },
  };

  Object.keys(sunTimes).sort().reduce((menu, key) => {
    const title = titlizeKey(key);
    menu[title] = () => {
      m = E.showMenu();
      drawSunShowPage(gps, key, sunTimes[key]);
    };
    return menu;
  }, sunMenu);

  sunMenu["< Back"] = () => m = indexPageMenu(gps);

  return E.showMenu(sunMenu);
}


function moonIndexPageMenu(gps) {
  const moonMenu = {
    "": {
      "title": "-- Moon --",
    },
    "Times": () => {
      m = E.showMenu();
      drawMoonTimesPage(gps, "Times");
    },
    "Position": () => {
      m = E.showMenu();
      drawMoonPositionPage(gps, "Position");
    },
    "Illumination": () => {
      m = E.showMenu();
      drawMoonIlluminationPage(gps, "Illumination");
    },
    "< Back": () => m = indexPageMenu(gps),
  };

  return E.showMenu(moonMenu);
}

function indexPageMenu(gps) {
  const menu = {
    "": {
      "title": "Select",
    },
    "Sun": () => {
      m = sunIndexPageMenu(gps);
    },
    "Moon": () => {
      m = moonIndexPageMenu(gps);
    },
    "< Exit": () => { load(); }
  };

  return E.showMenu(menu);
}

function getCenterStringX(str) {
  return (g.getWidth() - g.stringWidth(str)) / 2;
}

/**
 * GPS wait page, shows GPS locating animation until it gets a lock, then moves to the Sun page
 */
function drawGPSWaitPage() {
  const img = require("heatshrink").decompress(atob("mEwxH+AH4A/AH4AW43GF1wwsFwYwqFwowoFw4wmFxIwdE5YAPF/4vM5nN6YAE5vMF8YtHGIgvhFpQxKF7AuOGA4vXFyAwGF63MFyIABF6xeWMC4UDLwvNGpAJG5gwSdhIIDRBLyWCIgcJHAgJJDoouQF4vMQoICBBJoeGFx6GGACIfHL6YvaX6gvZeCIdFc4gAFXogvGFxgwFDwovQCAguOGAnMMBxeG5guTGAggGGAwNKFySREcA3N5vM5gDBdpQvXEY4AKXqovGGCKbFF7AwPZQwvZGJgtGF7vGdQItG5gSIF7gASF/44WEzgwRF0wwHF1AwFF1QwDF1gvwAH4A/AFAA=="));
  const str1 = "Astrocalc v0.02";
  const str2 = "Locating GPS";
  const str3 = "Please wait...";

  g.clear();
  g.drawImage(img, 100, 50);
  g.setFont("6x8", 1);
  g.drawString(str1, getCenterStringX(str1), 105);
  g.drawString(str2, getCenterStringX(str2), 140);
  g.drawString(str3, getCenterStringX(str3), 155);

  if (lastGPS) {
    lastGPS = JSON.parse(lastGPS);
    lastGPS.time = new Date();

    const str4 = "Press Button 3 to use last GPS";
    g.setColor("#d32e29");
    g.fillRect(0, 190, g.getWidth(), 215);
    g.setColor("#ffffff");
    g.drawString(str4, getCenterStringX(str4), 200);

    setWatch(() => {
      clearWatch();
      Bangle.setGPSPower(0);
      m = indexPageMenu(lastGPS);
    }, BTN3, {repeat: false});
  }

  g.flip();

  const DEBUG = false;
  if (DEBUG) {
    clearWatch();

    const gps = {
      "lat": 56.45783133333,
      "lon": -3.02188583333,
      "alt": 75.3,
      "speed": 0.070376,
      "course": NaN,
      "time":new Date(),
      "satellites": 4,
      "fix": 1
    };

    m = indexPageMenu(gps);

    return;
  }

  Bangle.on('GPS', (gps) => {
    if (gps.fix === 0) return;
    clearWatch();

    if (isNaN(gps.course)) gps.course = 0;
    require("Storage").writeJSON(LAST_GPS_FILE, JSON.stringify(gps));
    Bangle.setGPSPower(0);
    Bangle.buzz();
    Bangle.setLCDPower(true);

    m = indexPageMenu(gps);
  });
}

function init() {
  Bangle.setGPSPower(1);
  drawGPSWaitPage();
}

let m;
init();