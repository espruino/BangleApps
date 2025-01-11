const Layout = require("Layout");
const storage = require("Storage");
const locale = require("locale");
const SETTINGS_FILE = "weatherClock.json";
let s;
const w = require("weather");

// Weather icons from https://icons8.com/icon/set/weather/color
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
  return require("heatshrink").decompress(atob("mEw4UA///A4PgAYQA/ABkFqALJitUBatVqoKIgILBoALIq2VBZEFrWlJBALLitq1JIIqoLBJBFV1WqBY5GBBYJIHBYOlrQLHIwRIIioLDJAxSBBYJUHIwILBJA4LKKQQLCJAsFBYpIEKQILDKgpGBBYZIFBYQACBYqZCAAZIDdgILGJASlDAAZUDIwQ7DJAgLLIwYLDJAbsBBYxICIwxUDKQ5UDBYIAIBZgvBABBTCBQ7xGAH4AC"));
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
  if (condition.includes("thunderstorm")||
    condition.includes("squalls")||
    condition.includes("tornado")) return getStorm;
  if (condition.includes("freezing")||condition.includes("snow")||
    condition.includes("sleet")) {
    return getSnow;
  }
  if (condition.includes("drizzle")||
    condition.includes("shower")||
    condition.includes("rain")) return getRain;
  if (condition.includes("clear")) return getSun;
  if (condition.includes("clouds")) return getCloud;
  if (condition.includes("few clouds")||
    condition.includes("scattered clouds")||
    condition.includes("mist")||
    condition.includes("smoke")||
    condition.includes("haze")||
    condition.includes("sand")||
    condition.includes("dust")||
    condition.includes("fog")||
    condition.includes("ash")) {
    return getPartSun;
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

// Timeout used to update every minute
var drawTimeout;

// Schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function draw() {
  var date = new Date();
  cLayout.time.label = locale.time(date, 1);
  cLayout.dow.label = s.day ? locale.dow(date, 1).toUpperCase() + " " : "";
  cLayout.date.label = s.date ? locale.date(date, 1).toUpperCase() : "";
  let curr = w.get(); // Get weather from weather app.
  if(curr){
      const temp = locale.temp(curr.temp-273.15).match(/^(\D*\d*)(.*)$/);
      cLayout.temp.label = temp[1] + " " + temp[2];
      const code = curr.code || -1;
      if (code > 0) {
        let showIconC = s.src ? wDrawIcon(curr.code) : chooseIconByCode(curr.code);
        cLayout.wIcon.src = s.icon ? showIconC : getDummy;
      } else {
        let showIconT = s.src ? wDrawIcon(curr.txt) : chooseIcon(curr.txt);
        cLayout.wIcon.src = s.icon ? showIconT : getDummy;
      }
      const wind = locale.speed(curr.wind).match(/^(\D*\d*)(.*)$/);
      cLayout.wind.label = wind[1] + " " + wind[2] + " " + (curr.wrose||"").toUpperCase();
  }
  else{
      cLayout.temp.label = "Err";
      cLayout.wind.label = "No Data";
      cLayout.wIcon.src = s.icon ? getErr : getDummy;
  }
  cLayout.clear();
  cLayout.render();
  // Queue draw in one minute
  queueDraw();
}

// Load settings from file
s = storage.readJSON(SETTINGS_FILE,1)||{};
s.src = s.src === undefined ? false : s.src;
s.icon = s.icon === undefined ? true : s.icon;
s.day = s.day === undefined ? true : s.day;
s.date = s.date === undefined ? true : s.date;
s.wind = s.wind === undefined ? true : s.wind;

function wDrawIcon(code) {
  var ovr = Graphics.createArrayBuffer(50,50,8,{msb:true});
  if (typeof code == "number") w.drawIcon({code:code},24,24,24,ovr);
  if (typeof code == "string") w.drawIcon({txt:code},24,24,24,ovr);
  var img = ovr.asImage();
  img.transparent = 0;
  return img;
}

let srcIcons = s.src ? wDrawIcon(800) : getSun;
let srcWeather = s.icon ? srcIcons : getDummy;
let fontTemp = s.wind ? "10%" : "20%";
let fontWind = s.wind ? "10%" : "0%";
let labelDay = s.day ? "THU" : "";
let labelDate = s.date ? "01/01/1970" : "";
var cLayout = new Layout( {
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
      {type: "img", filly: 1, pad: 8, id: "wIcon", src: srcWeather},
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
cLayout.render();
draw();
