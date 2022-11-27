let clock_info = require("clock_info");
let locale = require("locale");
let storage = require("Storage");
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

let SETTINGS_FILE = "circlesclock.json";
let settings = Object.assign(
  storage.readJSON("circlesclock.default.json", true) || {},
  storage.readJSON(SETTINGS_FILE, true) || {}
);

 //TODO deprecate this (and perhaps use in the clkinfo module)
// Load step goal from health app and pedometer widget as fallback
if (settings.stepGoal == undefined) {
  let d = storage.readJSON("health.json", true) || {};
  settings.stepGoal = d != undefined && d.settings != undefined ? d.settings.stepGoal : undefined;

  if (settings.stepGoal == undefined) {
    d = storage.readJSON("wpedom.json", true) || {};
    settings.stepGoal = d != undefined && d.settings != undefined ? d.settings.goal : 10000;
  }
}

let timerHrm; //TODO deprecate this
let drawTimeout;

/*
 * Read location from myLocation app
 */
function getLocation() {
  return storage.readJSON("mylocation.json", 1) || undefined;
}
let location = getLocation();

let showWidgets = settings.showWidgets || false;
let circleCount = settings.circleCount || 3;
let showBigWeather = settings.showBigWeather || false;

let hrtValue; //TODO deprecate this
let now = Math.round(new Date().getTime() / 1000);

// layout values:
let colorFg = g.theme.dark ? '#fff' : '#000';
let colorBg = g.theme.dark ? '#000' : '#fff';
let colorGrey = '#808080';
let colorRed = '#ff0000';
let colorGreen = '#008000';
let colorBlue = '#0000ff';
let colorYellow = '#ffff00';
let widgetOffset = showWidgets ? 24 : 0;
let dowOffset = circleCount == 3 ? 20 : 22; // dow offset relative to date
let h = g.getHeight() - widgetOffset;
let w = g.getWidth();
let hOffset = (circleCount == 3 ? 34 : 30) - widgetOffset;
let h1 = Math.round(1 * h / 5 - hOffset);
let h2 = Math.round(3 * h / 5 - hOffset);
let h3 = Math.round(8 * h / 8 - hOffset - 3); // circle y position

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
let parts = circleCount * 2;
let circlePosX = [
  Math.round(1 * w / parts), // circle1
  Math.round(3 * w / parts), // circle2
  Math.round(5 * w / parts), // circle3
  Math.round(7 * w / parts), // circle4
];

let radiusOuter = circleCount == 3 ? 25 : 20;
let radiusInner = circleCount == 3 ? 20 : 15;
let circleFontSmall = circleCount == 3 ? "Vector:14" : "Vector:10";
let circleFont = circleCount == 3 ? "Vector:15" : "Vector:11";
let circleFontBig = circleCount == 3 ? "Vector:16" : "Vector:12";
let iconOffset = circleCount == 3 ? 6 : 8;
let defaultCircleTypes = ["Bangle/Steps", "Bangle/HRM", "Bangle/Battery", "weather"];

let circleInfoNum = [
  0, // circle1
  0, // circle2
  0, // circle3
  0, // circle4
];
let circleItemNum = [
  0, // circle1
  1, // circle2
  2, // circle3
  3, // circle4
];

function hideWidgets() {
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

function draw() {
  g.clear(true);
  let widgetUtils;

  try {
    widgetUtils = require("widget_utils");
  } catch (e) {
  }
  if (!showWidgets) {
    if (widgetUtils) widgetUtils.hide(); else hideWidgets();
  } else {
    if (widgetUtils) widgetUtils.show();
    Bangle.drawWidgets();
  }

  g.setColor(colorBg);
  g.fillRect(0, widgetOffset, w, h2 + 22);

  // time
  g.setFontRobotoRegular50NumericOnly();
  g.setColor(colorFg);
  if (!showBigWeather) {
    g.setFontAlign(0, -1);
    g.drawString(locale.time(new Date(), 1), w / 2, h1 + 6);
  }
  else {
    g.setFontAlign(-1, -1);
    g.drawString(locale.time(new Date(), 1), 2, h1 + 6);
  }
  now = Math.round(new Date().getTime() / 1000);

  // date & dow
  g.setFontRobotoRegular21();
  if (!showBigWeather) {
    g.setFontAlign(0, 0);
    g.drawString(locale.date(new Date()), w / 2, h2);
    g.drawString(locale.dow(new Date()), w / 2, h2 + dowOffset);
  } else {
    g.setFontAlign(-1, 0);
    g.drawString(locale.date(new Date()), 2, h2);
    g.drawString(locale.dow(new Date()), 2, h2 + dowOffset, 1);
  }

  // weather
  if (showBigWeather) {
    let weather = getWeather();
    let tempString = weather ? locale.temp(weather.temp - 273.15) : undefined;
    g.setFontAlign(1, 0);
    if (tempString) g.drawString(tempString, w, h2);

    let code = weather ? weather.code : -1;
    let icon = getWeatherIconByCode(code, true);
    if (icon) g.drawImage(icon, w - 48, h1, {scale:0.75});
  }

  drawCircle(1);
  drawCircle(2);
  drawCircle(3);
  if (circleCount >= 4) drawCircle(4);

  queueDraw();
}

function drawCircle(index) {
  let type = settings['circle' + index];
  if (!type) type = defaultCircleTypes[index - 1];
  let w = getCircleXPosition(type);

  switch (type) {
    case "weather":
      drawWeather(w);
      break;
    case "sunprogress":
    case "sunProgress":
      drawSunProgress(w);
      break;
    //TODO those are going to be deprecated, keep for backwards compatibility for now
    //ideally all data should come from some clkinfo
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
    case "temperature":
      drawTemperature(w);
      break;
    case "pressure":
      drawPressure(w);
      break;
    case "altitude":
      drawAltitude(w);
      break;
    //end deprecated
    case "empty":
      // we draw nothing here
      return;
    default:
      drawClkInfo(index, w);
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
    let setting = settings['circle' + i];
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
  let circlePos = getCirclePosition(type);
  if (circlePos != undefined) {
    return circlePosX[circlePos];
  }
  return undefined;
}

function isCircleEnabled(type) {
  return getCirclePosition(type) != undefined;
}

function getCircleColor(type) {
  let pos = getCirclePosition(type);
  let color = settings["circle" + (pos + 1) + "color"];
  if (color && color != "") return color;
}

function getCircleIconColor(type, color, percent) {
  let pos = getCirclePosition(type);
  let colorizeIcon = settings["circle" + (pos + 1) + "colorizeIcon"] == true;
  if (colorizeIcon) {
    return getGradientColor(color, percent);
  } else {
    return "";
  }
}

function getGradientColor(color, percent) {
  if (isNaN(percent)) percent = 0;
  if (percent > 1) percent = 1;
  let colorList = [
    '#00FF00', '#80FF00', '#FFFF00', '#FF8000', '#FF0000'
  ];
  if (color == "fg") {
    color = colorFg;
  }
  if (color == "green-red") {
    let colorIndex = Math.round(colorList.length * percent);
    return colorList[Math.min(colorIndex, colorList.length) - 1] || "#00ff00";
  }
  if (color == "red-green") {
    let colorIndex = colorList.length - Math.round(colorList.length * percent);
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

function drawWeather(w) {
  if (!w) w = getCircleXPosition("weather");
  let weather = getWeather();
  let tempString = weather ? locale.temp(weather.temp - 273.15) : undefined;
  let code = weather ? weather.code : -1;

  drawCircleBackground(w);

  let color = getCircleColor("weather");
  let percent;
  let data = settings.weatherCircleData;
  switch (data) {
    case "humidity":
      let humidity = weather ? weather.hum : undefined;
      if (humidity >= 0) {
        percent = humidity / 100;
        drawGauge(w, h3, percent, color);
      }
      break;
    case "wind":
      if (weather) {
        let wind = locale.speed(weather.wind).match(/^(\D*\d*)(.*)$/);
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
    let icon = getWeatherIconByCode(code);
    if (icon) g.drawImage(getImage(icon, getCircleIconColor("weather", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
  } else {
    g.drawString("?", w, h3 + radiusOuter);
  }
}

function drawSunProgress(w) {
  if (!w) w = getCircleXPosition("sunprogress");
  let percent = getSunProgress();

  // sunset icons:
  let sunSetDown = atob("EBCBAAAAAAABgAAAAAATyAZoBCB//gAAAAAGYAPAAYAAAAAA");
  let sunSetUp = atob("EBCBAAAAAAABgAAAAAATyAZoBCB//gAAAAABgAPABmAAAAAA");

  drawCircleBackground(w);

  let color = getCircleColor("sunprogress");

  drawGauge(w, h3, percent, color);

  drawInnerCircleAndTriangle(w);

  let icon = sunSetDown;
  let text = "?";
  let times = getSunData();
  if (times != undefined) {
    let sunRise = Math.round(times.sunrise.getTime() / 1000);
    let sunSet = Math.round(times.sunset.getTime() / 1000);
    if (!isDay()) {
      // night
      if (now > sunRise) {
        // after sunRise
        let upcomingSunRise = sunRise + 60 * 60 * 24;
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

/*
 * Deprecated but nice as references for clkinfo
 */

function drawSteps(w) {
  if (!w) w = getCircleXPosition("steps");
  let steps = getSteps();

  drawCircleBackground(w);

  let color = getCircleColor("steps");

  let percent;
  let stepGoal = settings.stepGoal;
  if (stepGoal > 0) {
    percent = steps / stepGoal;
    if (stepGoal < steps) percent = 1;
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, shortValue(steps));

  g.drawImage(getImage(atob("EBCBAAAACAAcAB4AHgAeABwwADgGeAZ4AHgAMAAAAHAAIAAA"), getCircleIconColor("steps", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawStepsDistance(w) {
  if (!w) w = getCircleXPosition("stepsDistance");
  let steps = getSteps();
  let stepDistance = settings.stepLength;
  let stepsDistance = Math.round(steps * stepDistance);

  drawCircleBackground(w);

  let color = getCircleColor("stepsDistance");

  let percent;
  let stepDistanceGoal = settings.stepDistanceGoal;
  if (stepDistanceGoal > 0) {
    percent = stepsDistance / stepDistanceGoal;
    if (stepDistanceGoal < stepsDistance) percent = 1;
    drawGauge(w, h3, percent, color);
  }

  drawInnerCircleAndTriangle(w);

  writeCircleText(w, shortValue(stepsDistance));

  g.drawImage(getImage(atob("EBCBAAAACAAcAB4AHgAeABwwADgGeAZ4AHgAMAAAAHAAIAAA"), getCircleIconColor("stepsDistance", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);
}

function drawHeartRate(w) {
  if (!w) w = getCircleXPosition("hr");

  let heartIcon = atob("EBCBAAAAAAAeeD/8P/x//n/+P/w//B/4D/AH4APAAYAAAAAA");

  drawCircleBackground(w);

  let color = getCircleColor("hr");

  let percent;
  if (hrtValue != undefined) {
    let minHR = settings.minHR;
    let maxHR = settings.maxHR;
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
  let battery = E.getBattery();

  let powerIcon = atob("EBCBAAAAA8ADwA/wD/AP8A/wD/AP8A/wD/AP8A/wD/AH4AAA");

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
function drawTemperature(w) {
  if (!w) w = getCircleXPosition("temperature");

  getPressureValue("temperature").then((temperature) => {
    drawCircleBackground(w);

    let color = getCircleColor("temperature");

    let percent;
    if (temperature) {
      let min = -40;
      let max = 85;
      percent = (temperature - min) / (max - min);
      drawGauge(w, h3, percent, color);
    }

    drawInnerCircleAndTriangle(w);

    if (temperature)
      writeCircleText(w, locale.temp(temperature));

    g.drawImage(getImage(atob("EBCBAAAAAYADwAJAAkADwAPAA8ADwAfgB+AH4AfgA8ABgAAA"), getCircleIconColor("temperature", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);

  });
}

function drawPressure(w) {
  if (!w) w = getCircleXPosition("pressure");

  getPressureValue("pressure").then((pressure) => {
    drawCircleBackground(w);

    let color = getCircleColor("pressure");

    let percent;
    if (pressure && pressure > 0) {
      let minPressure = 950;
      let maxPressure = 1050;
      percent = (pressure - minPressure) / (maxPressure - minPressure);
      drawGauge(w, h3, percent, color);
    }

    drawInnerCircleAndTriangle(w);

    if (pressure)
      writeCircleText(w, Math.round(pressure));

    g.drawImage(getImage(atob("EBCBAAAAAYADwAJAAkADwAPAA8ADwAfgB+AH4AfgA8ABgAAA"), getCircleIconColor("pressure", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);

  });
}

function drawAltitude(w) {
  if (!w) w = getCircleXPosition("altitude");

  getPressureValue("altitude").then((altitude) => {
    drawCircleBackground(w);

    let color = getCircleColor("altitude");

    let percent;
    if (altitude) {
      let min = 0;
      let max = 10000;
      percent = (altitude - min) / (max - min);
      drawGauge(w, h3, percent, color);
    }

    drawInnerCircleAndTriangle(w);

    if (altitude)
      writeCircleText(w, locale.distance(Math.round(altitude)));

    g.drawImage(getImage(atob("EBCBAAAAAYADwAJAAkADwAPAA8ADwAfgB+AH4AfgA8ABgAAA"), getCircleIconColor("altitude", color, percent)), w - iconOffset, h3 + radiusOuter - iconOffset);

  });
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

/*
 * end deprecated
 */

var menu = null;
function reloadMenu() {
  menu = clock_info.load();
  for(var i=1; i<5; i++)
    if(settings['circle'+i].includes("/")) {
      let parts = settings['circle'+i].split("/");
      let infoName = parts[0], itemName = parts[1];
      let infoNum = menu.findIndex(e=>e.name==infoName);
      let itemNum = 0;
      //suppose unnamed are varying (like timers or events), pick the first
      if(itemName)
        itemNum = menu[infoNum].items.findIndex(it=>it.name==itemName);
      circleInfoNum[i-1] = infoNum;
      circleItemNum[i-1] = itemNum;
    }
}
//reload periodically for changes?
reloadMenu();

function drawEmpty(img, w, color) {
  drawGauge(w, h3, 0, color);
  drawInnerCircleAndTriangle(w);
  writeCircleText(w, "?");
  if(img)
    g.setColor(getGradientColor(color, 0))
      .drawImage(img, w - iconOffset, h3 + radiusOuter - iconOffset, {scale: 16/24});
}

function drawClkInfo(index, w) {
  var info = menu[circleInfoNum[index-1]];
  var type = settings['circle'+index];
  if (!w) w = getCircleXPosition(type);
  drawCircleBackground(w);
  const color = getCircleColor(type);
  if(!info || !info.items.length) {
    drawEmpty(info? info.img : null, w, color);
    return;
  }
  var item = info.items[circleItemNum[index-1]];
  //TODO do hide()+get() here
  item.show();
  item.hide();
  item=item.get();
  var img = item.img;
  if(!img) img = info.img;
  let percent = (item.v-item.min) / item.max;
  if(isNaN(percent)) percent = 1; //fill it up
  drawGauge(w, h3, percent, color);
  drawInnerCircleAndTriangle(w);
  writeCircleText(w, item.text);
  g.setColor(getCircleIconColor(type, color, percent))
    .drawImage(img, w - iconOffset, h3 + radiusOuter - iconOffset, {scale: 16/24});
}

/*
 * wind goes from 0 to 12 (see https://en.wikipedia.org/wiki/Beaufort_scale)
 */
function windAsBeaufort(windInKmh) {
  let beaufort = [2, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
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
function getWeatherIconByCode(code, big) {
  let codeGroup = Math.round(code / 100);
  if (big == undefined) big = false;

  // weather icons:
  let weatherCloudy = big ? atob("QEDBAP//wxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAB//gAAAAAAAP//gAAAAAAD///AAAAAAAf4H+AAAAAAD8AD8AAAAAAfgAH4AAAAAB8AAPwAAAAAPgAAf/AAAAB8AAA//AAAAHgAAB/+AAAAeAAAH/8AAAH4AAAIH4AAB/AAAAAHwAAf8AAAAAPgAD/wAAAAAeAAPwAAAAAB4AB8AAAAAADwAHgAAAAAAPAA+AAAAAAA8ADwAAAAAADwA/AAAAAAAPAH8AAAAAAA8A/wAAAAAAHwH4AAAAAAAfg+AAAAAAAAfHwAAAAAAAA+eAAAAAAAAB54AAAAAAAAHvAAAAAAAAAP8AAAAAAAAA/wAAAAAAAAD/AAAAAAAAAP8AAAAAAAAA/wAAAAAAAAD3gAAAAAAAAeeAAAAAAAAB58AAAAAAAAPj4AAAAAAAB8H4AAAAAAAfgP////////8Af////////gA////////8AAf//////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAAAAAAAfgD/Af8H/4//7///////9//z/+AAAAAAAA");
  let weatherSunny = big ? atob("QEDBAP//wxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAwADwADAAAAHgAPAAeAAAAfAA8AD4AAAA+ADwAfAAAAB8APAD4AAAAD4B+AfAAAAAHw//D4AAAAAPv//fAAAAAAf///4AAAAAA/4H/AAAAAAB+AH4AAAAAAPgAHwAAAAAA8AAPAAAAAAHwAA+AAAAAAeAAB4AAAAAB4AAHgAAAAAPAAAPAAAA//8AAA//8AD//wAAD//wAP//AAAP//AA//8AAA//8AAADwAADwAAAAAHgAAeAAAAAAeAAB4AAAAAB8AAPgAAAAADwAA8AAAAAAPgAHwAAAAAAfgB+AAAAAAD/gf8AAAAAAf///4AAAAAD7//3wAAAAAfD/8PgAAAAD4B+AfAAAAAfADwA+AAAAD4APAB8AAAAfAA8AD4AAAB4ADwAHgAAADAAPAAMAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAAYAQCBAIA8AH4A/wb/YP8A/gB+ARiBAIAYABgAAA");
  let weatherMoon = big ?  atob("QEDBAP//wxgAAAYAAAAPAAAAD4AAAA8AAAAPwAAADwAAAA/gAAAPAAAAB/APAP/wAAAH+A8A//AAAAf4DwD/8AAAB/wPAP/wAAAH/gAADwAAAAe+AAAPAAAAB54AAA8AAAAHngAADwAAAAePAAAAAAAAD48OAAAAAAAPDw+AAAAAAB8PD8AAAAAAHg8P4AAAAAA+DwPwAAAAAHwfAfgAAAAB+D4A/AAA8AfwfgB/8AD//+D+AD/8AP//wfgAH/4Af/8B8AAf/wB//APgAAgfgD+AA8AAAAfAH8AHwAAAA+AP8B+AAAAB4Af//4AAAAHgA///gAAAAPAA//8AAAAA8AAf/wAAAADwAAAAAAAAAPAAAAAAAAAA8AcAAAAAAADwD+AAAAAAAfAfgAAAAAAB+D4AAAAAAAB8fAAAAAAAAD54AAAAAAAAHngAAAAAAAAe8AAAAAAAAA/wAAAAAAAAD/AAAAAAAAAP8AAAAAAAAA/wAAAAAAAAD/AAAAAAAAAPeAAAAAAAAB54AAAAAAAAHnwAAAAAAAA+PgAAAAAAAHwfgAAAAAAB+A/////////wB////////+AD////////wAB///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAAYAP8B/4P/w//D/8f/5//j/8P/w//B/4D/ABgAAA");
  let weatherPartlyCloudy = big ? atob("QEDBAP//wxgAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAAADwAAAAAABwAPAA4AAAAHgA8AHgAAAAfADwA+AAAAA+AfgHwAAAAB8P/w+AAAAAD7//3wAAAAAH///+BAAAAAP+B/wOAAAAAfgB+B8AAAAD4AD8H4AAAAPAA/wPwAAAB8AH+Af/AAAHgA/AA//AAAeAH4AB/+AADwAfAAH/8A//AD4AAIH4D/8AfAAAAHwP/wB4AAAAPg//AHgAAAAeAA8B+AAAAB4AB4fwAAAADwAHn/AAAAAPAAff8AAAAA8AA/8AAAAADwAD/AAAAAAPAEH4AAAAAA8A4PgAAAAAHwHgcAAAAAAfg+AwAAAAAAfHwAAAAAAAA+eAAAAAAAAB54AAAAAAAAHvAAAAAAAAAP8AAAAAAAAA/wAAAAAAAAD/AAAAAAAAAP8AAAAAAAAA/wAAAAAAAAD3gAAAAAAAAeeAAAAAAAAB58AAAAAAAAPj4AAAAAAAB8H4AAAAAAAfgP////////8Af////////gA////////8AAf//////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAAAAYQAMAD8AIQBhoW+AOYBwwOBBgHGAGP/wf+AAA");
  let weatherRainy = big ? atob("QEDBAP//wxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAB//gAAAAAAAP//gAAAAAAD///AAAAAAAf4H+AAAAAAD8AD8AAAAAAfgAH4AAAAAB8AAPwAAAAAPgAAf/AAAAB8AAA//AAAAHgAAB/+AAAAeAAAH/8AAAH4AAAIH4AAB/AAAAAHwAAf8AAAAAPgAD/wAAAAAeAAPwAAAAAB4AB8AAAAAADwAHgAAAAAAPAA+AAAAAAA8ADwAAAAAADwA/AAAAAAAPAH8AAAAAAA8A/wAAAAAAHwH4APAA8AAfg+AA8ADwAAfHwADwAPAAA+eAAPAA8AAB54AAAAAAAAHvAAAAAAAAAP8AAAAAAAAA/wAAAAAAAAD/AADw8PDwAP8AAPDw8PAA/wAA8PDw8AD3gADw8PDwAeeAAAAAAAAB58AAAAAAAAPj4AAAAAAAB8H4AAAAAAAfgP/w8PDw8P8Af/Dw8PDw/gA/8PDw8PD8AAfw8PDw8OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAPAAAAAAAPAA8AAAAAAA8ADwAAAAAADwAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAAYAH4AwwOBBgGEAOQAJBgjPOEkgGYAZgA8ABgAAA");
  let weatherPartlyRainy = big ? atob("QEDBAP//wxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAB//gAAAAAAAP//gAAAAAAD///AAAAAAAf4H+AAAAAAD8AD8AAAAAAfgAH4AAAAAB8AAPwAAAAAPgAAf/AAAAB8AAA//AAAAHgAAB/+AAAAeAAAH/8AAAH4AAAIH4AAB/AAAAAHwAAf8AAAAAPgAD/wAAAAAeAAPwAAAAAB4AB8AAAAAADwAHgAAAAAAPAA+AAAAAAA8ADwAAAAAADwA/AAAAAAAPAH8AAAAAAA8A/wAAAAAAHwH4AAAA8AAfg+AAAADwAAfHwAAAAPAAA+eAAAAA8AAB54AAAADwAAHvAAAAAPAAAP8AAAAA8AAA/wAAAADwAAD/AAAA8PAAAP8AAADw8AAA/wAAAPDwAAD3gAAA8PAAAeeAAADw8AAB58AAAPDwAAPj4AAA8PAAB8H4AADw8AAfgP//8PDw//8Af//w8PD//gA///Dw8P/8AAf/8PDw/+AAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAEEAQAAeADMAYaFvoTmAMMDgQIBxhhiGGG9wDwAGA");
  let weatherSnowy = big ? atob("QEDBAP//wxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAB//gAAAAAAAP//gAAAAAAD///AAAAAAAf4H+AAAAAAD8AD8AAAAAAfgAH4AAAAAB8AAPwAAAAAPgAAf/AAAAB8AAA//AAAAHgAAB/+AAAAeAAAH/8AAAH4AAAIH4AAB/AAAAAHwAAf8AAAAAPgAD/wAAAAAeAAPwAAAAAB4AB8AAAAAADwAHgAAAAAAPAA+AAAAAAA8ADwAAAAAADwA/AAAAAAAPAH8AAAAAAA8A/wAAAAAAHwH4AAAADwAfg+AAAAAPAAfHwAAAAA8AA+eAAAAADwAB54AA8AD/8AHvAADwAP/wAP8AAPAA//AA/wAA8AD/8AD/AA//AA8AAP8AD/8ADwAA/wAP/wAPAAD3gA//AA8AAeeAAPAAAAAB58AA8AAAAAPj4ADwAAAAB8H4APAAAAAfgP/wAA8A//8Af/AADwD//gA/8AAPAP/8AAfwAA8A/+AAAAAA//AAAAAAAAD/8AAAAAAAAP/wAAAAAAAA//AAAAAAAAAPAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAAAADwAGAEYg73C50BCAEIC50O9wRiAGAA8AAAAAA");
  let weatherFoggy = big ? atob("QEDBAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAwADwADAAAAHgAPAAeAAAAfAA8AD4AAAA+ADwAfAAAAB8APAD4AAAAD4B+AfAAAAAHw//D4AAAAAPv//fAAAAAAf///4AAAAAA/4H/AAAAAAB+AH4AAAAAAPgAHwAAAAAA8AAPAAAAAAHwAA+AAAAAAeAAB4AAAAAB4AAHgAAAAAPAAAPAAAAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AD///AADwAAAP//8AAeAAAA///wAB4AAAD///AAPgAAAAAAAAA8AAAAAAAAAHwAAAAAAAAB+AAAAAAAAAf8AAAAD///D/4AAAAP//8P3wAAAA///w8PgAAAD///CAfAAAAAAAAAA+AAAAAAAAAB8AAAAAAAAAD4AAAAAAAAAHgAAP//8PAAMAAA///w8AAAAAD///DwAAAAAP//8PAAAAAAAAAA8AAAAAAAAADwAAAAAAAAAPAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAAAADwAZgDDA4EGAcQAZAAgAAf74AAAAAd/4AAAAA");
  let weatherStormy = big ? atob("QEDBAP//wxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAB//gAAAAAAAP//gAAAAAAD///AAAAAAAf4H+AAAAAAD8AD8AAAAAAfgAH4AAAAAB8AAPwAAAAAPgAAf/AAAAB8AAA//AAAAHgAAB/+AAAAeAAAH/8AAAH4AAAIH4AAB/AAAAAHwAAf8AAAAAPgAD/wAAAAAeAAPwAAAAAB4AB8AAAAAADwAHgAAAAAAPAA+AAAAAAA8ADwAAAAAADwA/AAAAAAAPAH8AAAAAAA8A/wAAAAAAHwH4AAAAAAAfg+AAAAAAAAfHwAAAAAAAA+eAAAAAAAAB54AAAAD/AAHvAAAAAf4AAP8AAAAB/gAA/wAAAAP8AAD/AAAAA/gAAP8AAAAH+AAA/wAAAAfwAAD3gAAAD/AAAeeAAAAP4AAB58AAAB/AAAPj4AAAH8AAB8H4AAA/gAAfgP//+D//D/8Af//4f/4P/gA///B//B/8AAf/8P/8P+AAAAAAAPgAAAAAAAAB8AAAAAAAAAHwAAAAAAAAA+AAAAAAAAADwAAAAAAAAAfAAAAAAAAAB4AAAAAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : atob("EBCBAAAAAYAH4AwwOBBgGEAOQMJAgjmOGcgAgACAAAAAAAAA");
  let unknown = big ? atob("QEDBAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAf/4AAAAAAAH//4AAAAAAA///wAAAAAAH+B/gAAAAAA/AA/AAAAAAH4AB+AAAAAA/AAD4AAAAAD4H4HwAAAAAfB/4PgAAAAB8P/weAAAAAHg//h4AAAAA+Hw+HwAAAAD4eB8PAAAAAP/wDw8AAAAA//APDwAAAAD/8A8PAAAAAH/gDw8AAAAAAAAfDwAAAAAAAH4fAAAAAAAB/B4AAAAAAAf4HgAAAAAAD/A+AAAAAAAfwHwAAAAAAD8A+AAAAAAAPgH4AAAAAAB8B/AAAAAAAHgf4AAAAAAA+H+AAAAAAADwfwAAAAAAAPD8AAAAAAAA8PAAAAAAAAD/8AAAAAAAAP/wAAAAAAAA//AAAAAAAAB/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AAAAAAAAD/8AAAAAAAAP/wAAAAAAAA//AAAAAAAADw8AAAAAAAAPDwAAAAAAAA8PAAAAAAAADw8AAAAAAAAP/wAAAAAAAA//AAAAAAAAD/8AAAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") : undefined;
  
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
        return unknown;
  }
}


function isDay() {
  let times = getSunData();
  if (times == undefined) return true;
  let sunRise = Math.round(times.sunrise.getTime() / 1000);
  let sunSet = Math.round(times.sunset.getTime() / 1000);

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
    let SunCalc = require("https://raw.githubusercontent.com/mourner/suncalc/master/suncalc.js");
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
  let times = getSunData();
  if (times == undefined) return 0;
  let sunRise = Math.round(times.sunrise.getTime() / 1000);
  let sunSet = Math.round(times.sunset.getTime() / 1000);

  if (isDay()) {
    // during day
    let dayLength = sunSet - sunRise;
    if (now > sunRise) {
      return (now - sunRise) / dayLength;
    } else {
      return (sunRise - now) / dayLength;
    }
  } else {
    // during night
    if (now < sunRise) {
      let prevSunSet = sunSet - 60 * 60 * 24;
      return 1 - (sunRise - now) / (sunRise - prevSunSet);
    } else {
      let upcomingSunRise = sunRise + 60 * 60 * 24;
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
  let offset = 15;
  let end = 360 - offset;
  let radius = radiusInner + (circleCount == 3 ? 3 : 2);
  let size = radiusOuter - radiusInner - 2;

  if (percent <= 0) return; // no gauge needed
  if (percent > 1) percent = 1;

  let startRotation = -offset;
  let endRotation = startRotation - ((end - offset) * percent);

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
  let font = String(content).length > 4 ? circleFontSmall : String(content).length > 3 ? circleFont : circleFontBig;
  g.setFont(font);

  g.setFontAlign(0, 0);
  g.setColor(colorFg);
  g.drawString(content, w, h3);
}

function getWeather() {
  let jsonWeather = storage.readJSON('weather.json');
  return jsonWeather && jsonWeather.weather ? jsonWeather.weather : undefined;
}

Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;

    delete Graphics.prototype.setFontRobotoRegular50NumericOnly;
    delete Graphics.prototype.setFontRobotoRegular21;
  }});

Bangle.loadWidgets();

// schedule a draw for the next second or minute
function queueDraw() {
  let queueMillis = settings.updateInterval * 1000;
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, queueMillis - (Date.now() % queueMillis));
}

draw();
