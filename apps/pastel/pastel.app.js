var SunCalc = require("suncalc"); // from modules folder
require("f_latosmall").add(Graphics);
const storage = require('Storage');
const locale = require("locale");
const SETTINGS_FILE = "pastel.json";
const LOCATION_FILE = "mylocation.json";
const w = g.getWidth();
const h = g.getHeight();
let settings;
let location;

// variable for controlling idle alert
let lastStep = getTime();
let lastStepTime = '??';
let warned = 0;
let idle = false;
let IDLE_MINUTES = 26;

// cloud, sun, partSun, snow, rain, storm, error
// create 1 bit, max contrast, brightness set to 85
var cloudIcon = require("heatshrink").decompress(atob("kEggIfcj+AAYM/8ADBuFwAYPAmADCCAMBwEf8ADBhFwg4aBnEPAYMYjAVBhgDDDoQDHCYc4jwDB+EP///FYIDBMTgA=="));
var sunIcon = require("heatshrink").decompress(atob("kEggILIgOAAZkDAYPAgeBwPAgIFBBgPhw4TBp/yAYMcnADBnEcAYMwhgDBsEGgE/AYP8AYYLDCYgbDEYYrD8fHIwI7CIYZLDL54AHA=="));
//var sunPartIcon = require("heatshrink").decompress(atob("kEggIHEmADJjEwsEAjkw8EAh0B4EAg35wEAgP+CYMDwv8AYMDBAP2g8HgH+g0DBYMMgPwAYX8gOMEwMG3kAg8OvgSBjg2BgcYGQIcBAY5CBg0Av//HAM///4MYgNBEIMOCoUMDoUAnBwGkEA"));
var snowIcon = require("heatshrink").decompress(atob("kEggITQj/AAYM98ADBsEwAYPAjADCj+AgOAj/gAYMIuEHwEAjEPAYQVChk4AYQhCAYcYBYQTDnEPgEB+EH///IAQACE4IAB8EICIPghwDB4EeBYNAjgDBg8EAYQYCg4bCgZuFA=="));
var rainIcon = require("heatshrink").decompress(atob("kEggIPMh+AAYM/8ADBuFwAYPgmADB4EbAYOAj/ggOAhnwg4aBnAeCjEcCIMMjADCDoQDHjAPCnAXCuEP///8EDAYJECAAXBwkAgPDhwDBwUMgEEhkggEOjFgFgMQLYQAOA=="));
var errIcon = require("heatshrink").decompress(atob("kEggILIgOAAYsD4ADBg/gAYMGsADBhkwAYsYjADCjgDBmEMAYNxxwDBsOGAYPBwYDEgOBwOAgYDB4EDHYPAgwDBsADDhgDBFIcwjAHBjE4AYMcmADBhhNCKIcG/4AGOw4A=="));

// saves having to recode all the small font calls
function setSmallFont() {
  g.setFontLatoSmall();
}

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  settings.grid = settings.grid||false;
  settings.font = settings.font||"Lato";
  settings.idle_check = (settings.idle_check === undefined ? true : settings.idle_check);
}

// requires the myLocation app
function loadLocation() {
  location = require("Storage").readJSON(LOCATION_FILE,1)||{};
  location.lat = location.lat||51.5072;
  location.lon = location.lon||0.1276;
  location.location = location.location||"London";
}

function extractTime(d){
  var h = d.getHours(), m = d.getMinutes();
  return(("0"+h).substr(-2) + ":" + ("0"+m).substr(-2));
}

var sunRise = "00:00";
var sunSet = "00:00";
var drawCount = 0;

function updateSunRiseSunSet(now, lat, lon, line){
  // get today's sunlight times for lat/lon
  var times = SunCalc.getTimes(new Date(), lat, lon);

  // format sunrise time from the Date object
  sunRise = extractTime(times.sunrise);
  sunSet = extractTime(times.sunset);
}

function loadFonts() {
  // load font files based on settings.font
  if (settings.font == "Architect")
    require("f_architect").add(Graphics);
  else if (settings.font == "GochiHand")
    require("f_gochihand").add(Graphics);
  else if (settings.font == "CabinSketch")
    require("f_cabin").add(Graphics);
  else if (settings.font == "Orbitron")
    require("f_orbitron").add(Graphics);
  else if (settings.font == "Monoton")
    require("f_monoton").add(Graphics);
  else if (settings.font == "Elite")
    require("f_elite").add(Graphics);
  else
    require("f_lato").add(Graphics);
}

function getSteps() {
  try {
    return Bangle.getHealthStatus("day").steps;
  } catch (e) {
    if (WIDGETS.wpedom !== undefined)
      return WIDGETS.wpedom.getSteps();
    else
      return '???';
  }
}

const infoData = {
  ID_BLANK: { calc: () => '' },
  ID_DATE:  { calc: () => {var d = (new Date()).toString().split(" "); return d[2] + ' ' + d[1] + ' ' + d[3];} },
  ID_DAY:   { calc: () => {var d = require("locale").dow(new Date()).toLowerCase(); return d[0].toUpperCase() + d.substring(1);} },
  ID_SR:    { calc: () => 'Sunrise: ' + sunRise },
  ID_SS:    { calc: () => 'Sunset: ' + sunSet },
  ID_STEP:  { calc: () => 'Steps: ' + getSteps() },
  ID_LAST:  { calc: () => 'Last Step: ' + lastStepTime },
  ID_BATT:  { calc: () => 'Battery: ' + E.getBattery() + '%' },
  ID_MEM:   { calc: () => {var val = process.memory(false); return 'Ram: ' + Math.round(val.usage*100/val.total) + '%';} },
  ID_ID:    { calc: () => {var val = NRF.getAddress().split(':'); return 'Id: ' + val[4] + val[5];} },
  ID_FW:    { calc: () => 'Fw: ' + process.env.VERSION }
};

const infoList = Object.keys(infoData).sort();
let infoMode = infoList[0];

function nextInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === infoList.length - 1) infoMode = infoList[0];
    else infoMode = infoList[idx + 1];
  }
}

function prevInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === 0) infoMode = infoList[infoList.length - 1];
    else infoMode = infoList[idx - 1];
  }
}


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

function draw() {
  if (!idle)
    drawClock();
  else
    drawIdle();
  queueDraw();
}

function drawClock() {
  var d = new Date();
  var da = d.toString().split(" ");
  //var time = da[4].substr(0,5);

  var hh = da[4].substr(0,2);
  var mm = da[4].substr(3,2);
  //var day = da[0];
  //var month_day = da[1] + " " + da[2];

  // fix hh for 12hr clock
  var h2 = "0" + parseInt(hh) % 12 || 12;
  if (parseInt(hh) > 12)
    hh = h2.substr(h2.length -2);

  var x = (g.getWidth()/2);
  var y = (g.getHeight()/3);
  var weatherJson = getWeather();
  var w_temp;
  var w_icon;
  var w_wind;

  if (settings.weather && weatherJson && weatherJson.weather) {
      var currentWeather = weatherJson.weather;
      const temp = locale.temp(currentWeather.temp-273.15).match(/^(\D*\d*)(.*)$/);
      w_temp = temp[1] + " " + temp[2];
      w_icon = chooseIcon(currentWeather.txt);
      const wind = locale.speed(currentWeather.wind).match(/^(\D*\d*)(.*)$/);
      w_wind = wind[1] + " " + wind[2] + " " + (currentWeather.wrose||'').toUpperCase();
  } else {
      w_temp = "Err";
      w_wind = "???";
      w_icon = errIcon;
  }

  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);

  // draw a grid like graph paper
  if (settings.grid && process.env.HWVERSION !=1) {
    g.setColor("#0f0");
    for (var gx=20; gx <= w; gx += 20)
      g.drawLine(gx, 30, gx, h - 24);
    for (var gy=30; gy <= h - 24; gy += 20)
      g.drawLine(0, gy, w, gy);
  }

  g.setColor(g.theme.fg);

  // draw weather line
  if (settings.weather) {
    g.drawImage(w_icon, (w/2) - 40, 24);
    g.setFontLatoSmall();
    g.setFontAlign(-1,0); // left aligned
    if (drawCount % 2 == 0)
      g.drawString(w_temp, (w/2) + 6, 24 + ((y - 24)/2));
    else
      g.drawString( (w_wind.split(' ').slice(0, 2).join(' ')), (w/2) + 6, 24 + ((y - 24)/2));
  // display first 2 words of the wind string eg '4 mph'
  }

  if (settings.font == "Architect")
    g.setFontArchitect();
  else if (settings.font == "GochiHand")
    g.setFontGochiHand();
  else if (settings.font == "CabinSketch")
    g.setFontCabinSketch();
  else if (settings.font == "Orbitron")
    g.setFontOrbitron();
  else if (settings.font == "Monoton")
    g.setFontMonoton();
  else if (settings.font == "Elite")
    g.setFontSpecialElite();
  else
    g.setFontLato();

  g.setFontAlign(1,-1);  // right aligned
  g.drawString(hh, x - 6, y);
  g.setFontAlign(-1,-1); // left aligned
  g.drawString(mm, x + 6, y);

  // for the colon
  g.setFontAlign(0,-1); // centre aligned
  g.drawString(":", x,y);
  g.setFontLatoSmall();
  g.setFontAlign(0, -1);
  g.drawString((infoData[infoMode].calc()), w/2, h - 24 - 24);

  // recalc sunrise / sunset every hour
  if (drawCount % 60 == 0)
    updateSunRiseSunSet(new Date(), location.lat, location.lon);
  drawCount++;
  queueDraw();
}


/////////////////   IDLE TIMER /////////////////////////////////////

function log_debug(o) {
  //print(o);
}

function drawIdle() {
  let mins = Math.round((getTime() - lastStep) / 60);
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);
  g.setColor(g.theme.fg);
  setSmallFont();
  g.setFontAlign(0, 0);
  g.drawString('Last step was', w/2, (h/3));
  g.drawString(mins + ' minutes ago', w/2, 20+(h/3));
  dismissBtn.draw();
}

///////////////   BUTTON CLASS ///////////////////////////////////////////

// simple on screen button class
function BUTTON(name,x,y,w,h,c,f,tx) {
  this.name = name;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = c;
  this.callback = f;
  this.text = tx;
}

// if pressed the callback
BUTTON.prototype.check = function(x,y) {
  //console.log(this.name + ":check() x=" + x + " y=" + y +"\n");

  if (x>= this.x && x<= (this.x + this.w) && y>= this.y && y<= (this.y + this.h)) {
    log_debug(this.name + ":callback\n");
    this.callback();
    return true;
  }
  return false;
};

BUTTON.prototype.draw = function() {
  g.setColor(this.color);
  g.fillRect(this.x, this.y, this.x + this.w, this.y + this.h);
  g.setColor("#000"); // the icons and boxes are drawn black
  setSmallFont();
  g.setFontAlign(0, 0);
  g.drawString(this.text, (this.x + this.w/2), (this.y + this.h/2));
  g.drawRect(this.x, this.y, (this.x + this.w), (this.y + this.h));
};

function dismissPrompt() {
  idle = false;
  warned = false;
  lastStep = getTime();
  Bangle.buzz(100);
  draw();
}

var dismissBtn = new BUTTON("big",0, 3*h/4 ,w, h/4, "#0ff", dismissPrompt, "Dismiss");

Bangle.on('touch', function(button, xy) {
  if (idle && dismissBtn.check(xy.x, xy.y)) return;
});

// if we get a step then we are not idle
Bangle.on('step', s => {
  setLastStepTime();
  lastStep = getTime();
  // redraw if we had been idle
  if (idle == true) {
    dismissPrompt();
  }
  idle = false;
  warned = 0;
});

function setLastStepTime() {
  var date = new Date();
  lastStepTime = require("locale").time(date,1);
}

function checkIdle() {
  if (!settings.idle_check) {
    idle = false;
    warned = false;
    return;
  }

  let hour = (new Date()).getHours();
  let active = (hour >= 9 && hour < 21);
  //let active = true;
  let dur = getTime() - lastStep;

  if (active && dur > IDLE_MINUTES * 60) {
    drawIdle();
    if (warned++ < 3) {
      buzzer(warned);
      log_debug("checkIdle: warned=" + warned);
      Bangle.setLocked(false);
    }
    idle = true;
  } else {
    idle = false;
    warned = 0;
  }
}

setLastStepTime();

// timeout for multi-buzzer
var buzzTimeout;

// n buzzes
function buzzer(n) {
  log_debug("buzzer n=" + n);

  if (n-- < 1) return;
  Bangle.buzz(250);

  if (buzzTimeout) clearTimeout(buzzTimeout);
  buzzTimeout = setTimeout(function() {
    buzzTimeout = undefined;
    buzzer(n);
  }, 500);
}


///////////////////////////////////////////////////////////////////////////////

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    prevInfo();
    checkIdle();
    draw();
  }, 60000 - (Date.now() % 60000));
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI("clockupdown", btn=> {
  if (btn<0) prevInfo();
  if (btn>0) nextInfo();
  draw();
});

loadSettings();
loadFonts();
loadLocation();

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
