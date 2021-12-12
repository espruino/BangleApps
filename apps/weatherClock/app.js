const Layout = require("Layout");
const storage = require('Storage');
const locale = require("locale");

// weather icons from https://icons8.com/icon/set/weather/color
var sunIcon = require("heatshrink").decompress(atob("mEwwhC/AH4AbhvQC6vd7ouVC4IwUCwIwUFwQwQCYgAHDZQXc9wACC6QWDDAgXN7wXF9oXPCwowDC5guGGAYXMCw4wCC5RGJJAZGTJBiNISIylQVJrLCC5owGF65fXR7AwBC5jvhC7JIILxapDFxAXOGAy9KC4owGBAQXODAgHDC54AHC8T0FAAQSOGg4qPGA4WUGAIuVC7AA/AH4AEA="));

var partSunIcon = require("heatshrink").decompress(atob("mEwwhC/AH4AY6AWVhvdC6vd7owUFwIABFiYAFGR4Xa93u9oXTCwIYDC6HeC4fuC56MBC4ySOIwpIQXYQXHmYABRpwXECwQYKF5HjC4kwL5gQCAYYwO7wqFAAowK7wWKJBgXLJBPd6YX/AAoVMAAM/Cw0DC5yRHCx5JGFyAwGCyIwFC/4XyR4inXa64wRFwowQCw4A/AH4AkA"));

var cloudIcon = require("heatshrink").decompress(atob("mEwwhC/AH4A/AH4AtgczmYWWDCgWDmcwIKAuEGBoSGGCAWKC7BIKIxYX6CpgABn4tUSJIWPJIwuQGAwWRGAoX/C+SPEU67XXGCIuFGCAWHAH4A/AH4A/ADg="));

var snowIcon = require("heatshrink").decompress(atob("mEwwhC/AH4AhxGAC9YUBC4QZRhAVBAIWIC6QAEI6IYEI5cIBgwWOC64NCKohHPNox3RBgqnQEo7XPHpKONR5AXYAH4ASLa4XWXILiBC6r5LDBgWWDBRrKC5hsCEacIHawvMCIwvQC5QvQFAROEfZ5ADLJ4YGCywvVI7CPGC9IA/AH4AF"));

var rainIcon = require("heatshrink").decompress(atob("mEwwhC/AH4AFgczmYWWDCgWDmcwIKAuEGBoSGGCAWKC7BIKIxYX6CpgABn4tUSJIWPJIwuQGAwWRGAoX/C+SPEU67XXGCIuFGCAWHAGeIBJEIwAVJhGIC5AJBC5QMJEJQMEC44JBC6QSCC54FHLxgNBBgYSEDgKpPMhQXneSwuUAH4A/AA4="));

var stormIcon = require("heatshrink").decompress(atob("mEwwhC/AFEzmcwCyoYUgYXDmYuVGAY0OFwocHC6pNLCxYXYJBQXuCxhhJRpgYKCyBKFFyIXFCyJIFC/4XaO66nU3eza6k7C4IWFGBwXBCwwwO3ewC5AZMC6RaCIxZiI3e7AYYwRCQIIBC4QwPIQIpDC5owDhYREIxgAEFIouNC4orDFyBGBGAcLC6BaFhYWRLSRIFISQXcCyqhRAH4Az"));

// err icon - https://icons8.com/icons/set/error
var errIcon = require("heatshrink").decompress(atob("mEwwkBiIA/AH4AZUAIWUiAXBWqgXXdIYuVGCgXBgICCIyYXCJCQTDC6QrEMCQSEJCQRFC6ApGJCCiDDQSpQFAYXEJBqNGJCA/EC4ZIOEwgXFJBgNEAhKlNAgxIKBgoXEJBjsLC5TsIeRycMBhRrMMBKzQEozjOBxAgHGww+IA6wfSH4hnIC47OMSJqlRIJAXCACIXaGoQARPwwuTAH4A/ABw"));

/**
Choose weather icon to display based on condition.
Based on function from the Bangle weather app so it should handle all of the conditions
sent from gadget bridge.
*/
function chooseIcon(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("thunderstorm")) return stormIcon;
  if (condition.includes("freezing")||condition.includes("snow")||
    condition.includes("sleet")) {
    return snowIcon;
  }
  if (condition.includes("drizzle")||
    condition.includes("shower")) {
    return rainIcon;
  }
  if (condition.includes("rain")) return rainIcon;
  if (condition.includes("clear")) return sunIcon;
  if (condition.includes("few clouds")) return partSunIcon;
  if (condition.includes("scattered clouds")) return cloudIcon;
  if (condition.includes("clouds")) return cloudIcon;
  if (condition.includes("mist") ||
    condition.includes("smoke") ||
    condition.includes("haze") ||
    condition.includes("sand") ||
    condition.includes("dust") ||
    condition.includes("fog") ||
    condition.includes("ash") ||
    condition.includes("squalls") ||
    condition.includes("tornado")) {
    return cloudIcon;
  }
  return cloudIcon;
}

/**
Get weather stored in json file by weather app.
*/
function getWeather() {
  let jsonWeather = storage.readJSON('weather.json');
  return jsonWeather;
}

var clockLayout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"35%", halign: 0, fillx:1, pad: 8, label:"00:00", id:"time" },
    {type: "h", fillx: 1, c: [
        {type:"txt", font:"10%", label:"THU", id:"dow" },
        {type:"txt", font:"10%", label:"01/01/1970", id:"date" }
      ]
    },
    {type: "h", valign : 1, fillx:1, c: [
      {type: "img", filly: 1, id: "weatherIcon", src: sunIcon},
      {type: "v", fillx:1, c: [
          {type: "h", c: [
            {type: "txt", font: "10%", id: "temp", label: "000 °C"},
          ]},
          {type: "h", c: [
            {type: "txt", font: "10%", id: "wind", label: "00 km/h"},
          ]}
        ]
      },
    ]}]
});

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
  clockLayout.date.label = locale.date(date, 1).toUpperCase();
  clockLayout.dow.label = locale.dow(date, 1).toUpperCase() + " ";
  var weatherJson = getWeather();
  if(weatherJson && weatherJson.weather){
      var currentWeather = weatherJson.weather;
      const temp = locale.temp(currentWeather.temp-273.15).match(/^(\D*\d*)(.*)$/);
      clockLayout.temp.label = temp[1] + " " + temp[2];
      clockLayout.weatherIcon.src = chooseIcon(currentWeather.txt);
      const wind = locale.speed(currentWeather.wind).match(/^(\D*\d*)(.*)$/);
      clockLayout.wind.label = wind[1] + " " + wind[2] + " " + (currentWeather.wrose||'').toUpperCase();
  }
  else{
      clockLayout.temp.label = "Err";
      clockLayout.wind.label = "No Data";
      clockLayout.weatherIcon.src = errIcon;
  }
  clockLayout.clear();
  clockLayout.render();
  // queue draw in one minute
  queueDraw();
}

g.clear();
Bangle.setUI("clock");  // Show launcher when middle button pressed
Bangle.loadWidgets();
Bangle.drawWidgets();
clockLayout.render();
draw();
