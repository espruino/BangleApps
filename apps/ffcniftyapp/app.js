const w = require("weather");
const locale = require("locale");

// Weather icons from https://icons8.com/icon/set/weather/color
function getSun() {
  return require("heatshrink").decompress(atob("kEggILIgOAAZkDAYPAgeBwPAgIFBBgPhw4TBp/yAYMcnADBnEcAYMwhgDBsEGgE/AYP8AYYLDCYgbDEYYrD8fHIwI7CIYZLDL54AHA=="));
}
function getPartSun() {
  return require("heatshrink").decompress(atob("kcjwIVSgOAAgUwAYUGAYVgBoQHBkAIBocIDIX4CIcOAYMYg/wgECgODgE8oFAmEDxEYgYZBgQLBGYNAg/ggcYgANBAIIxBsPAG4MYsAIBoQ3ChAQCgI4BHYUEBgUADIIPBh///4GBv//8Cda"));
}
//function getPartRain() {
//  return require("heatshrink").decompress(atob("kEggIHEmADJjEwsEAjkw8EAh0B4EAg35wEAgP+CYMDwv8AYMDBAP2g8HgH+g0DBYMMgPwAYX8gOMEwMG3kAg8OvgSBjg2BgcYGQIcBAY5CBg0Av//HAM///4MYgNBEIMOCoUMDoUAnBwGkEA"));
//}
function getCloud() {
  return require("heatshrink").decompress(atob("kEggIfcj+AAYM/8ADBuFwAYPAmADCCAMBwEf8ADBhFwg4aBnEPAYMYjAVBhgDDDoQDHCYc4jwDB+EP///FYIDBMTgA=="));
}
function getSnow() {
  return require("heatshrink").decompress(atob("kEggITQj/AAYM98ADBsEwAYPAjADCj+AgOAj/gAYMIuEHwEAjEPAYQVChk4AYQhCAYcYBYQTDnEPgEB+EH///IAQACE4IAB8EICIPghwDB4EeBYNAjgDBg8EAYQYCg4bCgZuFA=="));
}
function getRain() {
  return require("heatshrink").decompress(atob("kEggIPMh+AAYM/8ADBuFwAYPgmADB4EbAYOAj/ggOAhnwg4aBnAeCjEcCIMMjADCDoQDHjAPCnAXCuEP///8EDAYJECAAXBwkAgPDhwDBwUMgEEhkggEOjFgFgMQLYQAOA=="));
}
function getStorm() {
  return require("heatshrink").decompress(atob("kcjwIROgfwAYMB44ICsEwAYMYgYQCgAICoEHCwMYgFDwEHCYfgEAMA4AIBmAXCgUGFIVAwADBhEQFIQtCGwNggPgjAVBngCBv8Oj+AgfjwYpCGAIABn4kBgOBBAVwjBHBD4IdBgYNBGwUAkCdbA="));
}
// err icon - https://icons8.com/icons/set/error
function getErr() {
  return require("heatshrink").decompress(atob("kEggILIgOAAYsD4ADBg/gAYMGsADBhkwAYsYjADCjgDBmEMAYNxxwDBsOGAYPBwYDEgOBwOAgYDB4EDHYPAgwDBsADDhgDBFIcwjAHBjE4AYMcmADBhhNCKIcG/4AGOw4A=="));
}
//function getDummy() {
//  return require("heatshrink").decompress(atob("gMBwMAwA"));
//}




/**
Choose weather icon to display based on condition.
Based on function from the Bangle weather app so it should handle all of the conditions
sent from gadget bridge.
*/
function chooseIcon(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("thunderstorm") ||
    condition.includes("squalls") ||
    condition.includes("tornado")) return getStorm;
  else if (condition.includes("freezing") || condition.includes("snow") ||
    condition.includes("sleet")) {
    return getSnow;
  }
  else if (condition.includes("drizzle") ||
    condition.includes("shower") ||
    condition.includes("rain")) return getRain;
  else if (condition.includes("clear")) return getSun;
  else if (condition.includes("clouds")) return getCloud;
  else if (condition.includes("few clouds") ||
    condition.includes("scattered clouds") ||
    condition.includes("mist") ||
    condition.includes("smoke") ||
    condition.includes("haze") ||
    condition.includes("sand") ||
    condition.includes("dust") ||
    condition.includes("fog") ||
    condition.includes("overcast") ||
    condition.includes("partly cloudy") ||
    condition.includes("ash")) {
    return getPartSun;
  } else return getErr;
}

/*
* Choose weather icon to display based on weather conditition code
* https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
*/
function chooseIconByCode(code) {
  const codeGroup = Math.round(code / 100);
  switch (codeGroup) {
    case 2: return getStorm;
    case 3: return getRain;
    case 5: 
      switch (code) {
          case 511: return getSnow;
          default: return getRain;
      }
    case 6: return getSnow;
    case 7: return getPartSun;
    case 8:
      switch (code) {
        case 800: return getSun;
        case 804: return getCloud;
        default: return getPartSun;
      }
    default: return getCloud;
  }
}

/*function condenseWeather(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("thunderstorm") ||
    condition.includes("squalls") ||
    condition.includes("tornado")) return "storm";
  if (condition.includes("freezing") || condition.includes("snow") ||
    condition.includes("sleet")) {
    return "snow";
  }
  if (condition.includes("drizzle") ||
    condition.includes("shower") ||
    condition.includes("rain")) return "rain";
  if (condition.includes("clear")) return "clear";
  if (condition.includes("clouds")) return "clouds";
  if (condition.includes("few clouds") ||
    condition.includes("scattered clouds") ||
    condition.includes("mist") ||
    condition.includes("smoke") ||
    condition.includes("haze") ||
    condition.includes("sand") ||
    condition.includes("dust") ||
    condition.includes("fog") ||
    condition.includes("overcast") ||
    condition.includes("partly cloudy") ||
    condition.includes("ash")) {
    return "scattered";
  } else { return "N/A"; }
  return "N/A";
}
*/
// copied from: https://gist.github.com/IamSilviu/5899269#gistcomment-3035480
function ISO8601_week_no(date) {
  var tdt = new Date(date.valueOf());
  var dayn = (date.getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

function format(value) {
  return ("0" + value).substr(-2);
}

const ClockFace = require("ClockFace");
const clock = new ClockFace({
  init: function () {
    const appRect = Bangle.appRect;

    this.viewport = {
      width: appRect.w,
      height: appRect.h
    };

    this.center = {
      x: this.viewport.width / 2,
      y: Math.round((this.viewport.height / 2) + appRect.y)
    };

    this.scale = g.getWidth() / this.viewport.width;
    this.centerTimeScaleX = this.center.x + 32 * this.scale;
    this.centerDatesScaleX = this.center.x + 40 * this.scale;
  },
  draw: function (date) {
    const hour = date.getHours() - (this.is12Hour && date.getHours() > 12 ? 12 : 0);
    const month = date.getMonth() + 1;
  //  const monthName = require("date_utils").month(month, 1);
  //  const dayName = require("date_utils").dow(date.getDay(), 1);
    let steps = Bangle.getHealthStatus("day").steps;
    let curr = (w.get() === undefined ? "no data" : w.get()); // Get weather from weather app.
    //let cWea =(curr === "no data" ?  "no data" : curr.txt);
    let cTemp= (curr === "no data" ? 273 : curr.temp);
    // const temp = locale.temp(curr.temp - 273.15).match(/^(\D*\d*)(.*)$/);

    let w_icon = getErr;
    if (locale.name === "en" || locale.name === "en_GB" || locale.name === "en_US") {
      w_icon = chooseIcon(curr.txt === undefined ? "no data" : curr.txt);
    } else {
    // cannot use condition string to determine icon if language is not English; use weather code instead
      const code = curr.code || -1;
        if (code > 0) {
          w_icon = chooseIconByCode(curr.code);
        }
    }

    g.setFontAlign(1, 0).setFont("Vector", 90 * this.scale);
    g.drawString(format(hour), this.centerTimeScaleX, this.center.y - 31 * this.scale);
    g.drawString(format(date.getMinutes()), this.centerTimeScaleX, this.center.y + 46 * this.scale);

    g.fillRect(this.center.x + 30 * this.scale, this.center.y - 72 * this.scale, this.center.x + 32 * this.scale, this.center.y + 74 * this.scale);

    g.setFontAlign(-1, 0).setFont("Vector", 16 * this.scale);
    g.drawString(format(date.getDate()), this.centerDatesScaleX, this.center.y - 62 * this.scale);  //26
    g.drawString("." + format(month) + ".", this.centerDatesScaleX + 20, this.center.y - 62 * this.scale);  //44
    g.drawString(date.getFullYear(date), this.centerDatesScaleX, this.center.y - 44 * this.scale); //62
    if (this.showWeekNum)
      g.drawString("CW" + format(ISO8601_week_no(date)), this.centerDatesScaleX, this.center.y + -26 * this.scale); //15
    // print(w_icon());
    if (this.showWeather) {
      g.drawImage(w_icon(), this.centerDatesScaleX, this.center.y - 8 * this.scale);
      // g.drawString(condenseWeather(curr.txt), this.centerDatesScaleX, this.center.y + 24 * this.scale);
      g.drawString((cTemp === undefined ? 273 : cTemp ) - 273 + "°C", this.centerDatesScaleX, this.center.y + 44 * this.scale); //48

    }
    if (this.showSteps)
      g.drawString(steps, this.centerDatesScaleX, this.center.y + 66 * this.scale);

  },
  settingsFile: "ffcniftyapp.json"
});
clock.start();
