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


// weather icons from https://icons8.com/icon/set/weather/ios-glyphs
var sunIcon = atob("Hh4BAAAAAAAMAAAAMAAAAMAAAAMAABgMBgBwADgA4AHAAY/GAAB/gAAD/wAAH/4AAP/8AAP/8AfP/8+fP/8+AP/8AAP/8AAH/4AAD/wAAB/gAAY/GAA4AHABwADgBgMBgAAMAAAAMAAAAMAAAAMAAAAAAAA=");

var partSunIcon = atob("Hh4B///////////z////z///7z3//x/j//5/n///h////A///+Af//GAf//GAfB/+B8Af/H4AP/uAAP58AAHx8AAH74AAH/4AAH/gAAB/gAAB/AAAA/AAAA/AAAA/AAAA/gAAB/wAAD///////////////A=");

var cloudIcon = atob("Hh4B///////////////////////////4H///gB///AA//+AAf/gAAf+AAAP+AAAP8AAAP8AAAPwAAADgAAABgAAABAAAAAAAAAAAAAAAAAAAAgAAABgAAABwAAAD8AAAP/////////////////////////A=");

var snowIcon = atob("Hh4B/////////////////4P///gD///AB//4AB//gAA//gDA//ADA/+Af4f4APwH4APwDwAf4DwADADwADADwAAAD4AAAH8AAAP//////z////z///+Af5//A/gf/A/gf+Afgf/z/gf/z/5///////////A=");

var rainIcon = atob("Hh4B/////////////////4P///gD///AB//4AB//gAA//gAA//AAA/+AAAf4AAAH4AAAHwAAADwAAADwAAADwAAAD4AAAH8AAAP//////////+f+f/+f+f/+eeef/+f+f/+f+f////////////////////A=");

var stormIcon = atob("Hh4B/////////////////4P///gD///AB//4AB//gAA//gAA//AAA/+AAAf4AAAH4AOADwAfADwAbADwA7ADwAzAD4BzwH8Bj4P//gf///Af/+fA//+f4//+f5+f//5+f//7+f//7/////////////////A=");

// from https://icons8.com/icon/set/error-cloud/ios-glyphs
var errIcon = atob("Hh4B///////////////////////////4H///gB///AA//+AAf/gAAf+AAAP+AMAP8AMAP8AMAPwAMADgAMABgAMABAAMAAAAAAAAAAAAAAMAAgAMABgAAABwAAAD8AAAP/////////////////////////A=");

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
  mon = ("0"+(mon+1)).substr(-2);
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
  g.reset();
  g.clearRect(22,35,153,75);
  g.setFont("4x5NumPretty",8);
  g.fillRect(84, 42, 92, 49);
  g.fillRect(84, 60, 92, 67);
  g.drawString(h, 22, 35);
  g.drawString(m, 98, 35);
  
  g.clearRect(22, 95, 22+4*2*4+2*4, 95+2*5);
  g.setFont("4x5NumPretty",2);
  g.drawString(date, 22, 95);

  g.clearRect(22, 79, 22+24, 79+13);
  g.setFont("DoW");
  g.drawString(dow, 22, 79);

  // not needed in case icon is w/o transparency
  g.clearRect(126, 81, 126+32, 81+32);
  g.drawImage(weatherIcon, 126, 81);

  g.clearRect(126, 114, 126+5*4*4, 114+4*5);
  if (temp != "") {
    var x = 126;
    g.setFont("4x5NumPretty",4);
    g.drawString(temp[1], 126, 114);
    x += temp[1].length*4*4;
    g.fillRect(x, 114, x+6, 114+6);
    g.setColor("#fff").fillRect(x+2, 114+2, x+6-2, 114+6-2);
  }

  // queue draw in one minute
  queueDraw();
}

g.clear();
drawBg();
Bangle.setUI("clock");  // Show launcher when middle button pressed
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();

