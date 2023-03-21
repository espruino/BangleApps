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

const SunCalc = require("suncalc"); // from modules folder
const storage = require("Storage");
const BANGLEJS2 = process.env.HWVERSION == 2; // check for bangle 2

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
  const faceWidth = g.getWidth()/3; // watch face radius
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
  const moonColor = g.theme.dark ? {r: 1, g: 1, b: 1} : {r: 0, g: 0, b: 0};

  const pageData = {
    Azimuth: pos.azimuth.toFixed(2),
    Altitude: pos.altitude.toFixed(2),
    Distance: `${pos.distance.toFixed(0)} km`,
    "Parallactic Ang": pos.parallacticAngle.toFixed(2),
  };
  const azimuthDegrees = parseInt(pos.azimuth * 180 / Math.PI);

  drawData(title, pageData, null, g.getHeight()/2 - Object.keys(pageData).length/2*20);
  drawPoints();
  drawPoint(azimuthDegrees, 8, moonColor);

  let m = setWatch(() => {
    let m = moonIndexPageMenu(gps);
  }, BANGLEJS2 ? BTN : BTN3, {repeat: false, edge: "falling"});
}

function drawMoonIlluminationPage(gps, title) {
  const phaseNames = [
    /*LANG*/"New Moon", /*LANG*/"Waxing Crescent", /*LANG*/"First Quarter", /*LANG*/"Waxing Gibbous",
    /*LANG*/"Full Moon", /*LANG*/"Waning Gibbous", /*LANG*/"Last Quater", /*LANG*/"Waning Crescent",
  ];

  const phase = SunCalc.getMoonIllumination(new Date());
  const phaseIdx = Math.round(phase.phase*8);
  const pageData = {
    Phase: phaseNames[phaseIdx],
  };

  drawData(title, pageData, null, 35);
  drawMoon(phaseIdx, g.getWidth() / 2, g.getHeight() / 2);

  let m = setWatch(() => {
    let m = moonIndexPageMenu(gps);
  }, BANGLEJS2 ? BTN : BTN3, {repease: false, edge: "falling"});
}


function drawMoonTimesPage(gps, title) {
  const times = SunCalc.getMoonTimes(new Date(), gps.lat, gps.lon);
  const moonColor = g.theme.dark ? {r: 1, g: 1, b: 1} : {r: 0, g: 0, b: 0};

  const pageData = {
    Rise: dateToTimeString(times.rise),
    Set: dateToTimeString(times.set),
  };

  drawData(title, pageData, null, g.getHeight()/2 - Object.keys(pageData).length/2*20 + 5);
  drawPoints();

  // Draw the moon rise position
  const risePos = SunCalc.getMoonPosition(times.rise, gps.lat, gps.lon);
  const riseAzimuthDegrees = parseInt(risePos.azimuth * 180 / Math.PI);
  drawPoint(riseAzimuthDegrees, 8, moonColor);

  // Draw the moon set position
  const setPos = SunCalc.getMoonPosition(times.set, gps.lat, gps.lon);
  const setAzimuthDegrees = parseInt(setPos.azimuth * 180 / Math.PI);
  drawPoint(setAzimuthDegrees, 8, moonColor);

  let m = setWatch(() => {
    let m = moonIndexPageMenu(gps);
  }, BANGLEJS2 ? BTN : BTN3, {repease: false, edge: "falling"});
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

  drawData(key, pageData, null, g.getHeight()/2 - Object.keys(pageData).length/2*20 + 5);

  drawPoints();

  // Draw the suns position
  drawPoint(azimuthDegrees, 8, {r: 1, g: 1, b: 0});

  m = setWatch(() => {
    m = sunIndexPageMenu(gps);
  }, BANGLEJS2 ? BTN : BTN3, {repeat: false, edge: "falling"});

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
      drawMoonTimesPage(gps, /*LANG*/"Times");
    },
    "Position": () => {
      m = E.showMenu();
      drawMoonPositionPage(gps, /*LANG*/"Position");
    },
    "Illumination": () => {
      m = E.showMenu();
      drawMoonIlluminationPage(gps, /*LANG*/"Illumination");
    },
    "< Back": () => m = indexPageMenu(gps),
  };

  return E.showMenu(moonMenu);
}

function indexPageMenu(gps) {
  const menu = {
    "": {
      "title": /*LANG*/"Select",
    },
    /*LANG*/"Sun": () => {
      m = sunIndexPageMenu(gps);
    },
    /*LANG*/"Moon": () => {
      m = moonIndexPageMenu(gps);
    },
    "< Back": () => { load(); }
  };

  return E.showMenu(menu);
}

function getCenterStringX(str) {
  return (g.getWidth() - g.stringWidth(str)) / 2;
}

function init() {
  let location = require("Storage").readJSON("mylocation.json",1)||{"lat":51.5072,"lon":0.1276,"location":"London"};
  indexPageMenu(location);
}

let m;
init();
