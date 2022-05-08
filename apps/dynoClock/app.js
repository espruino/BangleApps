const storage = require('Storage');
const locale = require("locale");




// add modifiied 4x5 numeric font
(function(graphics) {
  graphics.prototype.setFont4x5NumPretty = function() {
    this.setFontCustom(atob("IQAQDJgH4/An4QXr0Fa/BwnwdrcH63BCHwfr8Ha/"), 45, atob("AwIEBAQEBAQEBAQEBA=="), 5);
  }
})(Graphics);

// add font for days of the week
(function(graphics) {
  graphics.prototype.setFontDoW = function() {
    this.setFontCustom(atob("///////ADgB//////+AHAD//////gAAAH//////4D8B+A///////4AcAOAH//////4AcAOAAAAAB//////wA4AcAP//////wAAAAAAAA//////4AcAP//////wA4Af//////gAAAH//////5z85+c/OfnOAA4AcAOAH//////4AcAOAAAAAB//////wcAOAHB//////wAAAAAAAA///////ODnBzg5wc4AAAAD//////84OcH//8/+fAAAAAAAAAAAAA/z/5/8/OfnPz/5/8/wAAAD//////84OcH//////AAAAAAAAAAAAA/z/5/8/OfnPz/5/8/wAAAD//////gBwA///////AAAAAAAAAAAAA"), 48, 24, 13);
  }
})(Graphics);



var bgImg = require("heatshrink").decompress(atob("2E7wINKn///+AEaIVUgIUB//wCs/5CtRXrCvMD8AVTg4LFCv4VZ/iSLCrwWMCrMOAQMPCp7cBCojjFCo/xFgIVQgeHCopABCpcH44Vuh/AQQX/wAV7+F/Cq/nCsw/CCqyvRCvgODCqfAgEDCp4QCSIIVQgIOBDQgGDABX/NgIECCp8HCrM/CgP4CqKaCCqSfCCqq1BCqBuB54VqgYVG/gCECp0BwgCDCp8HgYCDCo/wCo0MgHAjACBj7rDABS1Bv4lBv4rPAAsPCo3+gbbPJAIVFiAXMFZ2AUQsAuAQHiOAgJeEA"));


// weather icons from https://icons8.com/icon/set/weather/small
var sunIcon = require("heatshrink").decompress(atob("kEgwIMJgYDJgUDgMAg8DgeAgeDg8AgPHxwQB//8AYN4vADBsEYAYvAhkAn/Ah/wAYYLDC5AjDFYQzDHYZDDJYZbLAB4="));

var partSunIcon = require("heatshrink").decompress(atob("kEgwIEBmAICAYUQmEggE4mFwgEcvHggEP//AgEHw+MgEGg+OAYMPg/Ahkcg/w/kYDwP8nEAjEMEQMMg3wAYMHwADBkY2BhlxAYMOsADBgwxBgEDAZYTDFQIbBn////8J4P/GIIAW"));

var cloudIcon = require("heatshrink").decompress(atob("kEgwIURg/gAYMf/ADBnk8AYNwhwDBsEH4EA8EH+EBAoM4gYDBjEGCIMMhgDGEIUMuADBh1gAYMGDQMADwQDJCYYbDn////8h4DB+CDXA"));

var snowIcon = require("heatshrink").decompress(atob("kEgwIURg/gAYMf/ADBnk8AYNwhwDBsEH4EA8EH+EBAoM4gYDBjEGCIMMhgDGEIUMuACBh1gAYMG4Ewn4eBAYf8hgDEsEwgEGuADBh0/gHD/kPAYPwgEDAQIDEgBEBAYoAFA="));

var rainIcon = require("heatshrink").decompress(atob("kEgwIURg/gAYMf/ADBnk8AYNwhwDBsEH4EA8EH+EBAoM4gYDBjEGCIMMhgDGEIUMuEA4EOsADBgwaB4AeCAYUM5gDEsADBg1wAYMOn/M5n8h4DB+A1JAYwAG"));

var stormIcon = require("heatshrink").decompress(atob("kEgwIURg/gAYMf/ADBnk8AYNwhwDBsEH4EA8EH+EBAoM4gYDBjEGCIMMhgDGEIUMuADBh1gAYMGDQM8DwV4AY3wgYTB8EGuEB8EOn/5/n8h/z/PwEQMwLgQtCKAIDCEIIAHA"));

var errIcon = require("heatshrink").decompress(atob("kEgwIURg/gAYMf/ADBnk8AYNwhwDBsEH4EA8EH+EB4HAnEDAYMYg0A4EMhgDGEIIDBuADBh1gAYMGEgMADwIDE4ADECYMAgwbBgEOn////8h4DB+CDXA"));

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

/*
* Choose weather icon to display based on weather conditition code
* https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
*/
function chooseIconByCode(code) {
  const codeGroup = Math.round(code / 100);
  switch (codeGroup) {
    case 2: return stormIcon;
    case 3: return rainIcon;
    case 5: return rainIcon;
    case 6: return snowIcon;
    case 7: return cloudIcon;
    case 8:
      switch (code) {
        case 800: return sunIcon;
        case 801: return partSunIcon;
        default: return cloudIcon;
      }
    default: return cloudIcon;
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

// only draw the first time
function drawBg() {
  g.reset();
  g.drawImage(bgImg, 0, 101);
}

function draw() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  h = ("0"+h).substr(-2);
  m = ("0"+m).substr(-2);

  var day = d.getDate(), mon = d.getMonth(), dow = d.getDay();
  day = ("0"+day).substr(-2);
  mon = ("0"+mon).substr(-2);
  dow = ((dow+6) % 7).toString();
  date = day + "." + mon

  var weatherJson = getWeather();
  var weatherIcon;
  var temp;
  if(weatherJson && weatherJson.weather){
      var currentWeather = weatherJson.weather;
      temp = locale.temp(currentWeather.temp-273.15).match(/^(\D*\d*)(.*)$/);
      const code = currentWeather.code || -1;
      if (code > 0) {
        weatherIcon = chooseIconByCode(code);
      } else {
        weatherIcon = chooseIcon(currentWeather.txt);
      }
  }
  else{
      temp = "";
      weatherIcon = errIcon;
  }
  weatherIcon = chooseIconByCode(700);
  g.reset();
  g.setFont("4x5NumPretty",8);
  g.clearRect(22,35,153,75);
  g.fillRect(84, 42, 92, 49);
  g.fillRect(84, 60, 92, 67);
  g.drawString(h, 22, 35);
  g.drawString(m, 98, 35);
  
  g.setFont("4x5NumPretty",2);
  g.clearRect(22, 95, 22+4*2*4+2*4, 95+2*5);
  g.drawString(date, 22, 95);
  g.setFont("DoW");
  g.clearRect(22, 79, 22+24, 79+13);
  g.drawString(dow, 22, 79);

  g.clearRect(119, 81, 126+32, 81+32);
  g.drawImage(weatherIcon, 126, 81);
  if (temp != "") {
    g.clearRect(126, 114, 126+5*4*4, 114+4*5);
    g.setFont("4x5NumPretty",4);
    g.drawString(temp[1], 126, 114);
    g.setFont("4x6", 2);
    g.drawString("o", 126+temp[1].length*4*4+5, 112);
  }

  // queue draw in one minute
  queueDraw();
}

g.clear();
Bangle.setUI("clock");  // Show launcher when middle button pressed
Bangle.loadWidgets();
Bangle.drawWidgets();
drawBg();
draw();

