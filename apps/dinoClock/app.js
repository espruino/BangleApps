const storage = require('Storage');
const locale = require("locale");




// add modifiied 4x5 numeric font
(function(graphics) {
  graphics.prototype.setFont4x5NumPretty = function() {
    this.setFontCustom(atob("IQAQDJgH4/An4QXr0Fa/BwnwdrcH63BCHwfr8Ha/"),45,atob("AwIEBAQEBAQEBAQEBA=="),5);
  };
})(Graphics);

// add font for days of the week
(function(graphics) {
  graphics.prototype.setFontDoW = function() {
    this.setFontCustom(atob("///////ADgB//////+AHAD//////gAAAH//////4D8B+A///////4AcAOAH//////4AcAOAAAAAB//////wA4AcAP//////wAAAAAAAA//////4AcAP//////wA4Af//////gAAAH//////5z85+c/OfnOAA4AcAOAH//////4AcAOAAAAAB//////wcAOAHB//////wAAAAAAAA///////ODnBzg5wc4AAAAD//////84OcH//8/+fAAAAAAAAAAAAA/z/5/8/OfnPz/5/8/wAAAD//////84OcH//////AAAAAAAAAAAAA/z/5/8/OfnPz/5/8/wAAAD//////gBwA///////AAAAAAAAAAAAA"),48,24,13);
  };
})(Graphics);


const SUN = 1;
const PART_SUN = 2;
const CLOUD = 3;
const SNOW = 4;
const RAIN = 5;
const STORM = 6;
const ERR = 7;

/**
Choose weather icon based on weather const
Weather icons from https://icons8.com/icon/set/weather/ios-glyphs
Error icon from https://icons8.com/icon/set/error-cloud/ios-glyphs
**/
function weatherIcon(weather) {
  switch (weather) {
    case SUN:
      return atob("Hh4BAAAAAAAMAAAAMAAAAMAAAAMAABgMBgBwADgA4AHAAY/GAAB/gAAD/wAAH/4AAP/8AAP/8AfP/8+fP/8+AP/8AAP/8AAH/4AAD/wAAB/gAAY/GAA4AHABwADgBgMBgAAMAAAAMAAAAMAAAAMAAAAAAAA=");
    case PART_SUN:
      return atob("Hh4BAAAAAAAAAAAMAAAAMAAAEMIAAOAcAAGAYAAAeAAAA/AAAB/gAA5/gAA5/g+AB+D/gA4H/wAR//wGD//4OD//4EH//4AH//4Af//+Af//+A////A////A////A///+Af//+AH//4AAAAAAAAAAAAAAAA=");
    case CLOUD:
      return atob("Hh4BAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAf+AAA//AAB//gAf//gB///wB///wD///wD///wP///8f///+f///+////////////////////f///+f///+P///8D///wAAAAAAAAAAAAAAAAAAAAAAAAAA=");
    case SNOW:
      return atob("Hh4BAAAAAAAAAAAAAAAAAHwAAAf8AAA/+AAH/+AAf//AAf8/AA/8/AB/gHgH/wP4H/wP4P/gH8P/8/8P/8/8P///4H///4B///gAAAAAAMAAAAMAAAB/gGAA/AfgA/AfgB/gfgAMAfgAMAGAAAAAAAAAAAA=");
    case RAIN:
      return atob("Hh4BAAAAAAAAAAAAAAAAAHwAAAf8AAA/+AAH/+AAf//AAf//AA///AB///gH///4H///4P///8P///8P///8P///4H///4B///gAAAAAAAAAABgBgABgBgABhhhgABgBgABgBgAAAAAAAAAAAAAAAAAAAAA=");
    case STORM:
      return atob("Hh4BAAAAAAAAAAAAAAAAAHwAAAf8AAA/+AAH/+AAf//AAf//AA///AB///gH///4H/x/4P/g/8P/k/8P/E/8P/M/4H+MP4B+cHgAAfgAAA/gABg/AABgHAABgGBgAAGBgAAEBgAAEAAAAAAAAAAAAAAAAAA=");
    case ERR:
    default:
      return atob("Hh4BAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAf+AAA//AAB//gAf//gB///wB/z/wD/z/wD/z/wP/z/8f/z/+f/z/+//z//////////////z//f/z/+f///+P///8D///wAAAAAAAAAAAAAAAAAAAAAAAAAA=");
    }
}


/**
Choose weather icon to display based on condition.
Based on function from the Bangle weather app so it should handle all of the conditions
sent from gadget bridge.
*/
function chooseIcon(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("thunderstorm")) return weatherIcon(STORM);
  if (condition.includes("freezing")||condition.includes("snow")||
    condition.includes("sleet")) {
    return weatherIcon(SNOW);
  }
  if (condition.includes("drizzle")||
    condition.includes("shower")) {
    return weatherIcon(RAIN);
  }
  if (condition.includes("rain")) return weatherIcon(RAIN);
  if (condition.includes("clear")) return weatherIcon(SUN);
  if (condition.includes("few clouds")) return weatherIcon(PART_SUN);
  if (condition.includes("scattered clouds")) return weatherIcon(CLOUD);
  if (condition.includes("clouds")) return weatherIcon(CLOUD);
  if (condition.includes("mist") ||
    condition.includes("smoke") ||
    condition.includes("haze") ||
    condition.includes("sand") ||
    condition.includes("dust") ||
    condition.includes("fog") ||
    condition.includes("ash") ||
    condition.includes("squalls") ||
    condition.includes("tornado")) {
    return weatherIcon(CLOUD);
  }
  return weatherIcon(CLOUD);
}

/*
* Choose weather icon to display based on weather conditition code
* https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
*/
function chooseIconByCode(code) {
  const codeGroup = Math.round(code / 100);
  switch (codeGroup) {
    case 2: return weatherIcon(STORM);
    case 3: return weatherIcon(RAIN);
    case 5: return weatherIcon(RAIN);
    case 6: return weatherIcon(SNOW);
    case 7: return weatherIcon(CLOUD);
    case 8:
      switch (code) {
        case 800: return weatherIcon(SUN);
        case 801: return weatherIcon(PART_SUN);
        default: return weatherIcon(CLOUD);
      }
    default: return weatherIcon(CLOUD);
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
  },60000-(Date.now()%60000));
}

// only draw the first time
function drawBg() {
  var bgImg = require("heatshrink").decompress(atob("2E7wINKn///+AEaIVUgIUB//wCs/5CtRXrCvMD8AVTg4LFCv4VZ/iSLCrwWMCrMOAQMPCp7cBCojjFCo/xFgIVQgeHCopABCpcH44Vuh/AQQX/wAV7+F/Cq/nCsw/CCqyvRCvgODCqfAgEDCp4QCSIIVQgIOBDQgGDABX/NgIECCp8HCrM/CgP4CqKaCCqSfCCqq1BCqBuB54VqgYVG/gCECp0BwgCDCp8HgYCDCo/wCo0MgHAjACBj7rDABS1Bv4lBv4rPAAsPCo3+gbbPJAIVFiAXMFZ2AUQsAuAQHiOAgJeEA"));
  g.reset();
  g.drawImage(bgImg,0,101);
}

function square(x,y,w,e) {
  g.setColor("#000").fillRect(x,y,x+w,y+w);
  g.setColor("#fff").fillRect(x+e,y+e,x+w-e,y+w-e);
}

function draw() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  h = ("0"+h).substr(-2);
  m = ("0"+m).substr(-2);

  var day = d.getDate(), mon = d.getMonth(), dow = d.getDay();
  day = ("0"+day).substr(-2);
  mon = ("0"+(mon+1)).substr(-2);
  dow = ((dow+6)%7).toString();
  date = day+"."+mon;

  var weatherJson = getWeather();
  var wIcon;
  var temp;
  if(weatherJson && weatherJson.weather){
      var currentWeather = weatherJson.weather;
      temp = locale.temp(currentWeather.temp-273.15).match(/^(\D*\d*)(.*)$/);
      const code = currentWeather.code||-1;
      if (code > 0) {
        wIcon = chooseIconByCode(code);
      } else {
        wIcon = chooseIcon(currentWeather.txt);
      }
  }else{
      temp = "";
      wIcon = weatherIcon(ERR);
  }
  g.reset();
  g.clearRect(22,35,153,75);
  g.setFont("4x5NumPretty",8);
  g.fillRect(84,42,92,49);
  g.fillRect(84,60,92,67);
  g.drawString(h,22,35);
  g.drawString(m,98,35);

  g.clearRect(22,95,22+4*2*4+2*4,95+2*5);
  g.setFont("4x5NumPretty",2);
  g.drawString(date,22,95);

  g.clearRect(22,79,22+24,79+13);
  g.setFont("DoW");
  g.drawString(dow,22,79);

  g.drawImage(wIcon,126,81);

  g.clearRect(108,114,176,114+4*5);
  if (temp != "") {
    var tempWidth;
    const mid=126+15;
    if (temp[1][0]=="-") {
      // do not account for - when aligning
      const minusWidth=3*4;
      tempWidth = minusWidth+(temp[1].length-1)*4*4;
      x = mid-Math.round((tempWidth-minusWidth)/2)-minusWidth;
    } else {
      tempWidth = temp[1].length*4*4;
      x = mid-Math.round(tempWidth/2);
    }
    g.setFont("4x5NumPretty",4);
    g.drawString(temp[1],x,114);
    square(x+tempWidth,114,6,2);
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

