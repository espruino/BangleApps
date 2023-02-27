const Layout = require("Layout");
const storage = require('Storage');
const locale = require("locale");
const SETTINGS_FILE = "weatherClock.json";
let settings;
const weather = require('weather');

// weather icons from https://icons8.com/icon/set/weather/color
function getSun() {
  return require("heatshrink").decompress(atob("mEwwhC/AH4AbhvQC6vd7ouVC4IwUCwIwUFwQwQCYgAHDZQXc9wACC6QWDDAgXN7wXF9oXPCwowDC5guGGAYXMCw4wCC5RGJJAZGTJBiNISIylQVJrLCC5owGF65fXR7AwBC5jvhC7JIILxapDFxAXOGAy9KC4owGBAQXODAgHDC54AHC8T0FAAQSOGg4qPGA4WUGAIuVC7AA/AH4AEA="));
}
function getPartSun() { 
  return require("heatshrink").decompress(atob("mEwwhC/AH4AY6AWVhvdC6vd7owUFwIABFiYAFGR4Xa93u9oXTCwIYDC6HeC4fuC56MBC4ySOIwpIQXYQXHmYABRpwXECwQYKF5HjC4kwL5gQCAYYwO7wqFAAowK7wWKJBgXLJBPd6YX/AAoVMAAM/Cw0DC5yRHCx5JGFyAwGCyIwFC/4XyR4inXa64wRFwowQCw4A/AH4AkA"));
}
function getCloud() {
  return require("heatshrink").decompress(atob("mEwwhC/AH4A/AH4AtgczmYWWDCgWDmcwIKAuEGBoSGGCAWKC7BIKIxYX6CpgABn4tUSJIWPJIwuQGAwWRGAoX/C+SPEU67XXGCIuFGCAWHAH4A/AH4A/ADg="));
}
function getSnow() {
  return require("heatshrink").decompress(atob("mEwwhC/AH4AhxGAC9YUBC4QZRhAVBAIWIC6QAEI6IYEI5cIBgwWOC64NCKohHPNox3RBgqnQEo7XPHpKONR5AXYAH4ASLa4XWXILiBC6r5LDBgWWDBRrKC5hsCEacIHawvMCIwvQC5QvQFAROEfZ5ADLJ4YGCywvVI7CPGC9IA/AH4AF"));
}
function getRain() {
  return require("heatshrink").decompress(atob("mEwwhC/AH4AFgczmYWWDCgWDmcwIKAuEGBoSGGCAWKC7BIKIxYX6CpgABn4tUSJIWPJIwuQGAwWRGAoX/C+SPEU67XXGCIuFGCAWHAGeIBJEIwAVJhGIC5AJBC5QMJEJQMEC44JBC6QSCC54FHLxgNBBgYSEDgKpPMhQXneSwuUAH4A/AA4="));
}
function getStorm() {
  return require("heatshrink").decompress(atob("mEwwhC/AFEzmcwCyoYUgYXDmYuVGAY0OFwocHC6pNLCxYXYJBQXuCxhhJRpgYKCyBKFFyIXFCyJIFC/4XaO66nU3eza6k7C4IWFGBwXBCwwwO3ewC5AZMC6RaCIxZiI3e7AYYwRCQIIBC4QwPIQIpDC5owDhYREIxgAEFIouNC4orDFyBGBGAcLC6BaFhYWRLSRIFISQXcCyqhRAH4Az"));
}
// err icon - https://icons8.com/icons/set/error
function getErr() {
  return require("heatshrink").decompress(atob("mEwwkBiIA/AH4AZUAIWUiAXBWqgXXdIYuVGCgXBgICCIyYXCJCQTDC6QrEMCQSEJCQRFC6ApGJCCiDDQSpQFAYXEJBqNGJCA/EC4ZIOEwgXFJBgNEAhKlNAgxIKBgoXEJBjsLC5TsIeRycMBhRrMMBKzQEozjOBxAgHGww+IA6wfSH4hnIC47OMSJqlRIJAXCACIXaGoQARPwwuTAH4A/ABw"));
}
function getDummy() {
  return require("heatshrink").decompress(atob("gMBwMAwA"));
}

/**
Choose weather icon to display based on condition.
Based on function from the Bangle weather app so it should handle all of the conditions
sent from gadget bridge.
*/
function chooseIcon(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("thunderstorm")) return getStorm;
  if (condition.includes("freezing")||condition.includes("snow")||
    condition.includes("sleet")) {
    return getSnow;
  }
  if (condition.includes("drizzle")||
    condition.includes("shower")) {
    return getRain;
  }
  if (condition.includes("rain")) return getRain;
  if (condition.includes("clear")) return getSun;
  if (condition.includes("few clouds")) return getPartSun;
  if (condition.includes("scattered clouds")) return getCloud;
  if (condition.includes("clouds")) return getCloud;
  if (condition.includes("mist") ||
    condition.includes("smoke") ||
    condition.includes("haze") ||
    condition.includes("sand") ||
    condition.includes("dust") ||
    condition.includes("fog") ||
    condition.includes("ash") ||
    condition.includes("squalls") ||
    condition.includes("tornado")) {
    return getCloud;
  }
  return getCloud;
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
    case 5: return getRain;
    case 6: return getSnow;
    case 7: return getCloud;
    case 8:
      switch (code) {
        case 800: return getSun;
        case 801: return getPartSun;
        default: return getCloud;
      }
    default: return getCloud;
  }
}

/**
Get weather stored in json file by weather app.
*/
function getWeather() {
  let jsonWeather = storage.readJSON('weather.json');
  return jsonWeather;
}

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function draw() {
  var date = new Date();
  clockLayout.time.label = locale.time(date, 1);
  clockLayout.date.label = settings.date ? locale.date(date, 1).toUpperCase() : "";
  clockLayout.dow.label = settings.day ? locale.dow(date, 1).toUpperCase() + " " : "";
  let current = weather.get();
  if(current){
      const temp = locale.temp(current.temp-273.15).match(/^(\D*\d*)(.*)$/);
      clockLayout.temp.label = temp[1] + " " + temp[2];
      const code = current.code || -1;
      if (code > 0) {
        let srcIconsCode = settings.src ? weatherIcon(current.code) : chooseIconByCode(current.code);
        clockLayout.weatherIcon.src = settings.icon ? srcIconsCode : getDummy;
      } else {
        let srcIconsTxt = settings.src ? weatherIcon(current.txt) : chooseIcon(current.txt);
        clockLayout.weatherIcon.src = settings.icon ? srcIconsTxt : getDummy;
      }
      const wind = locale.speed(current.wind).match(/^(\D*\d*)(.*)$/);
      clockLayout.wind.label = wind[1] + " " + wind[2] + " " + (current.wrose||'').toUpperCase();
  }
  else{
      clockLayout.temp.label = "Err";
      clockLayout.wind.label = "No Data";
      clockLayout.weatherIcon.src = settings.icon ? getErr : getDummy;
  }
  clockLayout.clear();
  clockLayout.render();
  // queue draw in one minute
  queueDraw();
}

function loadSettings() {
  settings = storage.readJSON(SETTINGS_FILE,1)||{};
  settings.src = settings.src === undefined ? false : settings.src;
  settings.icon = settings.icon === undefined ? true : settings.icon;
  settings.day = settings.day === undefined ? true : settings.day;
  settings.date = settings.date === undefined ? true : settings.date;
  settings.wind = settings.wind === undefined ? true : settings.wind;
}

loadSettings();

function weatherIcon(code) {
  var ovr = Graphics.createArrayBuffer(48,56,1,{msb:true});
  if (typeof code == "number") weather.drawIcon({code:code},24,24,24,ovr);
  if (typeof code == "string") weather.drawIcon({code},24,24,24,ovr);
  var img = ovr.asImage();
  img.transparent = 0;
  return img;
}

let srcIcons = settings.src ? weatherIcon(800) : getSun;
let srcWeather = settings.icon ? srcIcons : getDummy;
let fontTemp = settings.wind ? "10%" : "20%";
let fontWind = settings.wind ? "10%" : "0%";
let labelDay = settings.day ? "THU" : "";
let labelDate = settings.date ? "01/01/1970" : "";
var clockLayout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"35%", halign: 0, fillx:1, pad: 8, label:"00:00", id:"time" },
    {type: "h", fillx: 1, c: [
      {type: "h", c: [
        {type:"txt", font:"10%", label:labelDay, id:"dow" },
        {type:"txt", font:"10%", label:labelDate, id:"date" }
        ]},
      ]
    },
    {type: "h", valign : 1, fillx:1, c: [
      {type: "img", filly: 1, pad: 8, id: "weatherIcon", src: srcWeather},
      {type: "v", fillx:1, c: [
          {type: "h", c: [
            {type: "txt", font: fontTemp, id: "temp", label: "000 °C"},
          ]},
          {type: "h", c: [
            {type: "txt", font: fontWind, id: "wind", label: "00 km/h"},
          ]}
        ]
      },
    ]}]
});

g.clear();
Bangle.setUI("clock");  // Show launcher when middle button pressed
Bangle.loadWidgets();
Bangle.drawWidgets();
clockLayout.render();
draw();
