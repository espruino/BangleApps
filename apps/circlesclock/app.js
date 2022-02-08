const locale = require("locale");
const storage = require("Storage");
const SunCalc = require("https://raw.githubusercontent.com/mourner/suncalc/master/suncalc.js");

const shoesIcon = atob("EBCBAAAACAAcAB4AHgAeABwwADgGeAZ4AHgAMAAAAHAAIAAA");
const heartIcon = atob("EBCBAAAAAAAeeD/8P/x//n/+P/w//B/4D/AH4APAAYAAAAAA");
const powerIcon = atob("EBCBAAAAA8ADwA/wD/AP8A/wD/AP8A/wD/AP8A/wD/AH4AAA");
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

Graphics.prototype.setFontRobotoRegular50NumericOnly = function(scale) {
  // Actual height 39 (40 - 2)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAB8AAAAAAAfAAAAAAAPwAAAAAAB8AAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAA4AAAAAAB+AAAAAAD/gAAAAAD/4AAAAAH/4AAAAAP/wAAAAAP/gAAAAAf/gAAAAAf/AAAAAA/+AAAAAB/+AAAAAB/8AAAAAD/4AAAAAH/4AAAAAD/wAAAAAA/wAAAAAAPgAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///wAAAB////gAAA////8AAA/////gAAP////8AAH8AAA/gAB8AAAD4AA+AAAAfAAPAAAADwADwAAAA8AA8AAAAPAAPAAAADwADwAAAA8AA8AAAAPAAPgAAAHwAB8AAAD4AAfwAAD+AAD/////AAA/////wAAH////4AAAf///4AAAB///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAAAPgAAAAAADwAAAAAAB8AAAAAAAfAAAAAAAHgAAAAAAD4AAAAAAA+AAAAAAAPAAAAAAAH/////wAB/////8AA//////AAP/////wAD/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAfgAADwAAP4AAB8AAH+AAA/AAD/gAAfwAB/AAAf8AAfAAAP/AAPgAAH7wAD4AAD88AA8AAB+PAAPAAA/DwADwAAfg8AA8AAPwPAAPAAH4DwADwAH8A8AA+AD+APAAPwB/ADwAB/D/gA8AAf//gAPAAD//wADwAAf/wAA8AAD/4AAPAAAHwAADwAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAADgAAAHwAA+AAAD8AAP4AAB/AAD/AAA/wAA/wAAf4AAD+AAHwAAAPgAD4APAB8AA+ADwAPAAPAA8ADwADwAPAA8AA8ADwAPAAPAA8ADwADwAfAA8AA8AH4APAAPgD+AHwAB8B/wD4AAf7/+B+AAD//v//AAA//x//wAAD/4P/4AAAf8B/4AAAAYAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAHwAAAAAAH8AAAAAAD/AAAAAAD/wAAAAAD/8AAAAAB/vAAAAAB/jwAAAAA/g8AAAAA/wPAAAAAfwDwAAAAf4A8AAAAf4APAAAAP8ADwAAAP8AA8AAAH8AAPAAAD/////8AA//////AAP/////wAD/////8AA//////AAAAAAPAAAAAAADwAAAAAAA8AAAAAAAPAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAB/APwAAH//wD+AAD//8A/wAA///AH+AAP//wAPgAD/B4AB8AA8A+AAfAAPAPAADwADwDwAA8AA8A8AAPAAPAPAADwADwD4AA8AA8A+AAPAAPAPwAHwADwD8AD4AA8AfwD+AAPAH///AADwA///wAA8AH//4AAPAAf/4AAAAAB/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAD//+AAAAD///4AAAD////AAAB////4AAA/78D/AAAfw8AH4AAPweAA+AAD4PgAHwAB8DwAA8AAfA8AAPAAHgPAADwAD4DwAA8AA+A8AAPAAPAPgAHwADwD4AB8AA8AfgA+AAPAH+B/gAAAA///wAAAAH//4AAAAA//8AAAAAH/8AAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAA8AAAAAAAPAAAAAAADwAAAAAAA8AAAABAAPAAAABwADwAAAB8AA8AAAB/AAPAAAB/wADwAAD/8AA8AAD/8AAPAAD/4AADwAD/4AAA8AD/4AAAPAH/wAAADwH/wAAAA8H/wAAAAPH/wAAAAD3/gAAAAA//gAAAAAP/gAAAAAD/gAAAAAA/AAAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwA/4AAAH/Af/AAAH/8P/4AAD//n//AAA//7//4AAfx/+A+AAHwD+AHwAD4AfgB8AA8AHwAPAAPAA8ADwADwAPAA8AA8ADwAPAAPAA8ADwADwAfAA8AA+AH4AfAAHwD+AHwAB/D/4D4AAP/+/n+AAD//n//AAAf/w//gAAB/wH/wAAAHwA/4AAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAAD/8AAAAAD//wAAAAB//+AAAAA///wAAAAf4H+APAAH4AfgDwAD8AB8A8AA+AAfAPAAPAADwDwADwAA8B8AA8AAPAfAAPAADwHgADwAA8D4AA+AAeB+AAHwAHg/AAB+ADwfgAAP8D4/4AAD////8AAAf///8AAAB///+AAAAP//+AAAAAP/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAOAAAB8AAHwAAAfgAD8AAAH4AA/AAAB8AAHwAAAOAAA4AAAAAAAAAAAAAAAAAAAAAAAAAA"), 46, atob("DRUcHBwcHBwcHBwcDA=="), 50+(scale<<8)+(1<<16));
  return this;
};

Graphics.prototype.setFontRobotoRegular21 = function(scale) {
  // Actual height 22 (21 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAB/+YH/5gAAAAAAAAAAA+AAD4AAAAAA+AAD4AAAAAAAAAAAMAAYwABj+AH/4D/wAfjABGM4AZ/gD/4B/sAHYwABiAAEAAAAAAAAOAPw8A/h4HGBh4cHvgweGDhgcHOA8fwBw/AAAAAAAAPgAB/AAGMAAYwMBjDgD48AHHAABwAAOfADjuAcMYAAxgAD+AAHwAAAAAAAAAHgBx/AP3eB/wYGHBgY+GBjeYH4/gPA8AAHwAB/gAHGAAAAAAAA+AAD4AAAAAAAAAAA/gAf/wH//w8AHnAAHwAAEAAAMAAB4AAN4ABz8B+D//gD/4AAAAAAAAMAAAxAADMAAHwAH8AAf4AAPwAAzAADAAAAAAABgAAGAAAYAABgAD/8AP/wABgAAGAAAYAABgAAGAAAADAAB8AAPgAAYAAwAADAAAMAAAwAADAAAMAAAAAAAEAAA4AABgAAAAAAAAAAQAAPAAH4AB8AA/AAPgAH4AAcAAAAAAAAAAD/wA//wH4fgYAOBgAYGABgYAGB4B4D//AH/4AAAAAAAAAAAAYAADAAAMAABwAAH//gf/+AAAAAAAAAAAAAAAAAAAHAGA8A4HAHgYA+BgHYGB5gYPGB7wYD+BgHgGAAAYAAAAHA4A8DwHgDgYMGBgwYGDBgYcGB/44D9/AHj4AAAAAAMAABwAAfAAHsAA8wAPDADwMAf/+B//4H//gAAwAADAAAAAAAAAfjgH+HAf4OBjAYGMBgYwGBjg4GH/AYP4AAOAAAAAAfgAP/gB//AO4OBzAYGMBgYwGBjg4AH/AAP4AAEAAAAAYAABgAAGABgYAeBgHwGD8AY/ABvgAH4AAeAABAAAAAAADB4A/fwH/3gccGBgwYGDBgYcGB744D9/AHj4AAAAAAAAD8AA/4AHjxgYDGBgMYGAzgcDMA87wD/+AD/gAAAAAAAABgGAHA4AYBgAAAAAAAAYB8BwPgGAYAAAAAAAAAYAADwAAPAAB+AAGYAA5wADDAAcOABgYAAAAAAAAAZgABmAAGYAAZgABmAAGYAAZgABmAAGYAAZgAAAAAAAABgYAHDgAMMAA5wABmAAGYAAPAAA8AADwAAGAAAAAAAAAOAAA4AAHAAAYHmBg+YGHgAf4AA/AAAwAAAAAAAfwAH/4B4DwOADhwAGGD8Mw/4zHBjMYGMxgYzGPDMf+Mw8YhgBgHAGAOA4Af/AAPwAAAAAAAgAAeAAP4AD+AB/gA/mAHwYAeBgB/GAA/4AAfwAAfwAAPgAAGAAAAAAAAf/+B//4GDBgYMGBgwYGDBgYcGBz44D//AHz8AAHAAAAAAAAAH+AB/+AP/8A4A4HABgYAGBgAYGABgYAGB4A4DwPAHA4AAAAAAAAAAAB//4H//gYAGBgAYGABgYAGBgAYDADAPA8Af/gAf4AAAAAAAAAAAAf/+B//4GDBgYMGBgwYGDBgYMGBgwYGDBgYAGAAAAAAAAAAAB//4H//gYMABgwAGDAAYMABgwAGDAAYMABgAAAAAAB/AAf/AD//AeAcBgA4GABgYEGBgYYGBhgcGGA8fwBx/AAH4AAAAAAAAAAAB//4H//gAMAAAwAADAAAMAAAwAADAAAMAAAwAH//gf/+AAAAAAAAAAAAAAAH//gf/+AAAAAAAAAAQAADwAAPgAAOAAAYAABgAAGAAA4H//Af/8B//AAAAAAAAAAAAH//gf/+AA4AAHAAA+AAP8AB48APB4B4DwGADgQAGAAAIAAAAAAAB//4H//gAAGAAAYAABgAAGAAAYAABgAAGAAAIAAAAAAAB//4H//gfgAAfgAAPwAAPwAAH4AAHgAB+AAfgAPwAH8AB+AAH//gf/+B//4AAAAAAAAAAAH//gf/+A8AAB8AAB4AAD4AADwAAHwAAHgAAPgf/+B//4AAAAAAAAAAAAf4AH/4A//wDgHAcAOBgAYGABgYAGBwAYDADgPz8Af/gAf4AAAAAAAAAAAAf/+B//4GBgAYGABgYAGBgAYGABg4AHnAAP8AAfgAAAAAAAAAH+AB/+APz8AwAwHADgYAGBgAYGABgcAOA4B8D//4H/5gH+CAAAAAAAAAAAH//gf/+BgYAGBgAYGABgYAGD4AcP4A/z4D+HgDgGAAAAAAAADg4A/DwD+DAcYGBhwYGDBgYMGBg4YHBzgPH8AcPgAAAAYAABgAAGAAAYAABgAAH//gf/+B//4GAAAYAABgAAGAAAYAAAAAAH/4Af/4B//wAADgAAGAAAYAABgAAGAAA4AAfAf/8B//AAAAAQAAB4AAH8AAH+AAD+AAB/AAA+AAD4AB/AA/gAf4AH8AAeAABAAAAAAAfAAB/wAB/8AAP+AAD4AB/gA/wA/wAH4AAfgAAf4AAH+AAD+AAH4AH/gP/gB/gAHAAAAAAAAAAGABgcAOB8D4B4+AD/gAD8AAPwAD/wAeHgHwPgcAOBAAYAAAAQAABwAAHwAAPwAAPwAAP/gAP+AB/4AfAAHwAB8AAHAAAQAAAAAAGADgYAeBgH4GA9gYPmBh4YGfBgbwGB+AYHgBgcAGAAAIAAAA///7///v//+wAAbAABkAAAcAAB+AAB/AAA/AAAfgAAfgAAPAAAMMAAGwAAb///v//+AAAAAAAAAAAA4AAPgAH4AAeAAB+AAB+AAA4AAAgAAAAYAABgAAGAAAYAABgAAGAAAYAABgAAGAAAYAAABAAAGAAAcAAAwAAAAAAAAAAAAAAGOAA58AHu4AYxgBjGAGMYAYzgB/+AD/4AD/gAAAAAAAP//g//+D//4AcDgBgGAGAYAYBgBwOAD/wAH+AADAAAAAAD8AA/8AHh4AYBgBgGAGAYAYBgB4OADhwAGGAAAAAAAAAD8AA/8AHh4AYBgBgGAGAYAYBgAwMD//4P//gAAAAAAAAD8AA/8ADtwAYxgBjGAGMYAYxgB7OAD8wADyAAAAAEAAAYAAP/+B//4P//gxgADGAAMAAAAAAAA/AAP/MB4e4GAZgYBmBgGYGAZgMDeB//wH/+AAAAAAAD//4P//g//+AHAAAYAABgAAGAAAf/gA/+AB/4AAAAAAABn/4Gf/gZ/+AAAAAAAGZ//5n//mf/4AAAAAAAP//g//+D//4ABwAAPgAB/AAePABweAGA4AAAgAAAD//4P//g//+AAAAAAAAB/+AH/4Af/gBgAAGAAAYAABgAAH/4AP/gA/+AHAAAYAABgAAGAAAeAAA/+AB/4AAAAAAAAH/4Af/gB/+AHAAAYAABgAAGAAAf/gA/+AB/4AAAAAAAAA/AAP/AA4cAGAYAYBgBgGAGAYAcDgA/8AB/gAB4AAAAAAAAAf/+B//4H//gYBgBgGAGAYAYBgBwOAD/wAH+AADAAAAAAH8AA/8AHh4AYBgBgGAGAYAYBgAwOAH//gf/+AAAAAAAAAAAB/+AH/4Af/gBwAAGAAAYAAAAAABxgAPnAB+OAGcYAYxgBjGAHOYAefgA58AAAAAYAABgAA//wD//gBgOAGAYAQBgAAAAH/gAf/AB/+AAAYAABgAAGAAAYAf/gB/+AH/4AAAABAAAHgAAfwAAP4AAH4AAHgAD8AB/AAfgABwAAAAAAQAAB8A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"), 32, atob("BQYHDgwQDgQICAkMBAYGCQwMDAwMDAwMDAwFBQsMDAoUDg4ODg0MDxAGDA4MExAPDg8ODQ0ODhQODQ0GCQYJCgcMDAwMDAgMDAUFCwUTDA0MDQcLBwwLEQsKCwcFBw8ACw0ZEBgUGRoQGBQZGhIQDhMAAAAAEhEYExAUEBQQEA0FBQwNEAwFDgkRCgoMABEKCAwICAcMCwYFCAoKEBERCg4ODg4ODhUODQ0NDQYGBgYPEA8PDw8PDA8ODg4ODQ0NDAwMDAwMEwwMDAwMBQUFBQ0MDQ0NDQ0NDAwMDAwKDQo="), 22+(scale<<8)+(1<<16));
  return this;
};

const SETTINGS_FILE = "circlesclock.json";
let settings = Object.assign(
  storage.readJSON("circlesclock.default.json", true) || {},
  storage.readJSON(SETTINGS_FILE, true) || {}
);
// Load step goal from pedometer widget as fallback
if (settings.stepGoal == undefined) {
  const d = storage.readJSON("wpedom.json", true) || {};
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
const hOffset = (circleCount == 3 ? 34 : 30) - widgetOffset;
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

const radiusOuter = circleCount == 3 ? 25 : 20;
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
  g.setFontRobotoRegular50NumericOnly();
  g.setFontAlign(0, -1);
  g.setColor(colorFg);
  g.drawString(locale.time(new Date(), 1), w / 2, h1 + 8);
  now = Math.round(new Date().getTime() / 1000);

  // date & dow
  g.setFontRobotoRegular21();
  g.setFontAlign(0, 0);
  g.drawString(locale.date(new Date()), w / 2, h2);
  g.drawString(locale.dow(new Date()), w / 2, h2 + dowOffset);

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

function getCircleIconColor(type, color, percent) {
  const pos = getCirclePosition(type);
  const colorizeIcon = settings["circle" + (pos + 1) + "colorizeIcon"] == true;
  if (colorizeIcon) {
    return getGradientColor(color, percent);
  } else {
    return "";
  }
}

function getGradientColor(color, percent) {
  if (isNaN(percent)) percent = 0;
  if (percent > 1) percent = 1;
  const colorList = [
    '#00FF00', '#80FF00', '#FFFF00', '#FF8000', '#FF0000'
  ];
  if (color == "green-red") {
    const colorIndex = Math.round(colorList.length * percent);
    return colorList[Math.min(colorIndex, colorList.length) - 1] || "#00ff00";
  }
  if (color == "red-green") {
    const colorIndex = colorList.length - Math.round(colorList.length * percent);
    return colorList[Math.min(colorIndex, colorList.length)] || "#ff0000";
  }
  return color;
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

  const color = getCircleColor("steps");

  let percent;
  const stepGoal = settings.stepGoal;
  if (stepGoal > 0) {
    percent = steps / stepGoal;
    if (stepGoal < steps) percent = 1;
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, shortValue(steps));

  g.drawImage(getImage(shoesIcon, getCircleIconColor("steps", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawStepsDistance(w) {
  if (!w) w = getCircleXPosition("stepsDistance");
  const steps = getSteps();
  const stepDistance = settings.stepLength;
  const stepsDistance = Math.round(steps * stepDistance);

  drawCircleBackground(w);

  const color = getCircleColor("stepsDistance");

  let percent;
  const stepDistanceGoal = settings.stepDistanceGoal;
  if (stepDistanceGoal > 0) {
    percent = stepsDistance / stepDistanceGoal;
    if (stepDistanceGoal < stepsDistance) percent = 1;
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, shortValue(stepsDistance));

  g.drawImage(getImage(shoesIcon, getCircleIconColor("stepsDistance", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawHeartRate(w) {
  if (!w) w = getCircleXPosition("hr");

  drawCircleBackground(w);

  const color = getCircleColor("hr");

  let percent;
  if (hrtValue != undefined) {
    const minHR = settings.minHR;
    const maxHR = settings.maxHR;
    percent = (hrtValue - minHR) / (maxHR - minHR);
    if (isNaN(percent)) percent = 0;
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, hrtValue != undefined ? hrtValue : "-");

  g.drawImage(getImage(heartIcon, getCircleIconColor("hr", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawBattery(w) {
  if (!w) w = getCircleXPosition("battery");
  const battery = E.getBattery();

  drawCircleBackground(w);

  let color = getCircleColor("battery");

  let percent;
  if (battery > 0) {
    percent = battery / 100;
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

  g.drawImage(getImage(powerIcon, getCircleIconColor("battery", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawWeather(w) {
  if (!w) w = getCircleXPosition("weather");
  const weather = getWeather();
  const tempString = weather ? locale.temp(weather.temp - 273.15) : undefined;
  const code = weather ? weather.code : -1;

  drawCircleBackground(w);

  const color = getCircleColor("weather");
  let percent;
  const data = settings.weatherCircleData;
  switch (data) {
    case "humidity":
      const humidity = weather ? weather.hum : undefined;
      if (humidity >= 0) {
        percent = humidity / 100;
        drawGauge(w, h3, percent, color);
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
          percent = wind[1] / 12;
          drawGauge(w, h3, percent, color);
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
    if (icon) g.drawImage(getImage(icon, getCircleIconColor("weather", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
  } else {
    g.drawString("?", w, h3 + radiusOuter);
  }
}


function drawSunProgress(w) {
  if (!w) w = getCircleXPosition("sunprogress");
  const percent = getSunProgress();

  drawCircleBackground(w);

  const color = getCircleColor("sunprogress");

  drawGauge(w, h3, percent, color);

  drawInnerCircleAndTriangle(w);

  let icon = sunSetDown;
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
      icon = sunSetUp;
    } else {
      // day, approx sunrise tomorrow:
      text = formatSeconds(sunSet - now);
      icon = sunSetDown;
    }
  }

  writeCircleText(w, text);

  g.drawImage(getImage(icon, getCircleIconColor("sunprogress", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawTemperature(w) {
  if (!w) w = getCircleXPosition("temperature");

  getPressureValue("temperature").then((temperature) => {
    drawCircleBackground(w);

    const color = getCircleColor("temperature");

    let percent;
    if (temperature) {
      const min = -40;
      const max = 85;
      percent = (temperature - min) / (max - min);
      drawGauge(w, h3, percent, color);
    }

    drawInnerCircleAndTriangle(w);

    if (temperature)
      writeCircleText(w, locale.temp(temperature));

    g.drawImage(getImage(temperatureIcon, getCircleIconColor("temperature", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);

  });
}

function drawPressure(w) {
  if (!w) w = getCircleXPosition("pressure");

  getPressureValue("pressure").then((pressure) => {
    drawCircleBackground(w);

    const color = getCircleColor("pressure");

    let percent;
    if (pressure && pressure > 0) {
      const minPressure = 950;
      const maxPressure = 1050;
      percent = (pressure - minPressure) / (maxPressure - minPressure);
      drawGauge(w, h3, percent, color);
    }

    drawInnerCircleAndTriangle(w);

    if (pressure)
      writeCircleText(w, Math.round(pressure));

    g.drawImage(getImage(temperatureIcon, getCircleIconColor("pressure", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);

  });
}

function drawAltitude(w) {
  if (!w) w = getCircleXPosition("altitude");

  getPressureValue("altitude").then((altitude) => {
    drawCircleBackground(w);

    const color = getCircleColor("altitude");

    let percent;
    if (altitude) {
      const min = 0;
      const max = 10000;
      percent = (altitude - min) / (max - min);
      drawGauge(w, h3, percent, color);
    }

    drawInnerCircleAndTriangle(w);

    if (altitude)
      writeCircleText(w, locale.distance(Math.round(altitude)));

    g.drawImage(getImage(temperatureIcon, getCircleIconColor("altitude", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);

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
        default:
          return undefined;
  }
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

  if (percent <= 0) return; // no gauge needed
  if (percent > 1) percent = 1;

  const startRotation = -offset;
  const endRotation = startRotation - ((end - offset) * percent);

  color = getGradientColor(color, percent);
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
  return new Promise((resolve) => {
    if (Bangle.getPressure) {
      if (!pressureLocked) {
        pressureLocked = true;
        if (pressureCache && pressureCache[type]) {
          resolve(pressureCache[type]);
        }
        Bangle.getPressure().then(function(d) {
          pressureLocked = false;
          if (d) {
            pressureCache = d;
            if (d[type]) {
              resolve(d[type]);
            }
          }
        }).catch(() => {});
      } else {
        if (pressureCache && pressureCache[type]) {
          resolve(pressureCache[type]);
        }
      }
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


let timerHrm;
Bangle.on('HRM', function(hrm) {
  if (isCircleEnabled("hr")) {
    if (hrm.confidence >= (settings.confidence)) {
      hrtValue = hrm.bpm;
      if (Bangle.isLCDOn()) {
        drawHeartRate();
      }
    }
    // Let us wait before we overwrite "good" HRM values:
    if (Bangle.isLCDOn()) {
      if (timerHrm) clearTimeout(timerHrm);
      timerHrm = setTimeout(() => {
        hrtValue = '...';
        drawHeartRate();
      }, settings.hrmValidity * 1000);
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

// schedule a draw for the next minute
setTimeout(function() {
  // draw every 60 seconds
  setInterval(draw,60000);
}, 60000 - (Date.now() % 60000));

draw();
