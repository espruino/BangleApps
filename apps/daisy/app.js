var SunCalc = require("suncalc"); // from modules folder
const widget_utils = require('widget_utils');
const SETTINGS_FILE = "daisy.json";
const LOCATION_FILE = "mylocation.json";
const h = g.getHeight();
const w = g.getWidth();
let settings;
let location;

// variable for controlling idle alert
let lastStep = getTime();
let warned = 0;
let idle = false;
let IDLE_MINUTES = 26;

let pal1; // palette for 0-40%
let pal2; // palette for 50-100%
const infoLine = (3*h/4) - 6;
const infoWidth = 56;
const infoHeight = 11;
var drawingSteps = false;

function log_debug(o) {
  //print(o);
}

var hrmImg = require("heatshrink").decompress(atob("i0WgIKHgPh8Ef5/g///44CBz///1///5A4PnBQk///wA4PBA4MDA4MH/+Ah/8gEP4EAjw0GA"));

// https://www.1001fonts.com/rounded-fonts.html?page=3
Graphics.prototype.setFontBloggerSansLight46 = function(scale) {
  // Actual height 46 (45 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAA/AAAAAAAAPwAAAAAAAD4AAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAH/gAAAAAAP/wAAAAAAf/gAAAAAAf/AAAAAAA//AAAAAAB/+AAAAAAD/8AAAAAAH/4AAAAAAH/wAAAAAAP/gAAAAAAf/gAAAAAA//AAAAAAB/+AAAAAAA/8AAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///8AAAAP////4AAAP/////AAAH/////4AAD+AAAB/AAA8AAAAHwAAeAAAAA+AAHgAAAAHgADwAAAAB4AA8AAAAAPAAPAAAAADwADwAAAAA8AA8AAAAAPAAPAAAAADwAB4AAAAB4AAeAAAAAeAAHwAAAAPgAA/AAAAPwAAH/////4AAA/////8AAAH////+AAAAf///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAPAAAAAAAAHwAAAAAAAB4AAAAAAAA+AAAAAAAAfAAAAAAAAHgAAAAAAAD4AAAAAAAB8AAAAAAAAeAAAAAAAAPgAAAAAAADwAAAAAAAB//////4AAf//////AAH//////gAA//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAD4AAHAAAAD+AAD4AAAB/gAA8AAAB/4AAfAAAA/+AAHgAAAf3gAB4AAAPx4AA8AAAH4eAAPAAAD4HgADwAAB8B4AA8AAA+AeAAPAAAfAHgADwAAPgB4AA8AAHwAeAAHgAD4AHgAB4AD8AB4AAfAB+AAeAAD8B/AAHgAAf//gAB4AAH//wAAeAAAf/wAAHgAAB/wAAA4AAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AADgAAAAPAAB4AAAADwAAeAAAAA+AAHgAAAAHgAB4ABgAB4AAeAA8AAeAAHgA/AADwAB4AfwAA8AAeAP8AAPAAHgH/AADwAB4H7wAA8AAeD48AAPAAHh8PAAHgAB5+BwAB4AAe/AeAA+AAH/AHwAfAAB/gA/AfgAAfwAH//wAAHwAA//4AAA4AAH/8AAAAAAAf4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAD+AAAAAAAD/gAAAAAAH/4AAAAAAH/+AAAAAAP/ngAAAAAP/h4AAAAAf/AeAAAAAf/AHgAAAA/+AB4AAAA/+AAeAAAB/8AAHgAAA/8AAB4AAAP4AAAeAAAB4AAAHgAAAAAAAB4AAAAAAAAeAAAAAAP///4AAAAH////AAAAA////gAAAAP///4AAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAD4AA8AAD///gAPAAB///4AD4AAf//+AAeAAH+APAAHgAB4AHgAA4AAeAB4AAOAAHgAcAADwAB4AHAAA8AAeADwAAPAAHgAcAADwAB4AHAAA8AAeAB4AAeAAHgAeAAHgAB4AHwAD4AAeAA+AB8AAHgAP4B+AAB4AB///gAAOAAP//gAABAAA//wAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAB///4AAAAD////wAAAD////+AAAB/////4AAA/gPgB/AAAfgDwAHwAAPgA8AA+AADwAeAAHgAB4AHgAB4AAeAB4AAfAAHgAeAADwABwAHgAA8AAcAB4AAPAAHAAeAAHwAB4AHgAB4AAeAB8AAeAAHgAPAAPgAB4AD8APwAAOAAfwP4AADgAD//8AAAAAAf/+AAAAAAB/+AAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAAB4AAAAA4AAeAAAAB/AAHgAAAB/wAB4AAAB/4AAeAAAD/4AAHgAAD/wAAB4AAH/wAAAeAAH/gAAAHgAP/gAAAB4AP/AAAAAeAf/AAAAAHgf+AAAAAB4/+AAAAAAe/8AAAAAAH/8AAAAAAB/4AAAAAAAf4AAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAA/AB/+AAAA/8B//wAAA//gf/+AAAf/8PgPgAAH4fngB8AAD4B/wAPgAA8AP8AB4AAeAB+AAeAAHgAfgADwAB4ADwAA8AAcAA8AAPAAHAAPAADwAB4ADwAA8AAeAB+AAPAAHgAfgAHgAB8AP8AB4AAPgH/AA+AAD8H54AfAAAf/8fgPwAAD/+D//4AAAf/Af/8AAAB/AD/+AAAAAAAP+AAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAAf/wAAAAAAf/+AAAAAAP//4AAwAAH//+AAeAAD+APwAHgAA+AA+AB4AAfAAHgAOAAHgAB4ADwAB4AAPAA8AAeAADwAPAAHgAA8ADwAB4AAPAA8AAeAADwAPAAHgAA8AHgAB8AAeAB4AAPgAHgA+AAD8ADwA/AAAfwA8A/gAAD/wef/wAAAf////4AAAB////4AAAAH///wAAAAAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AB4AAAAAfgA/AAAAAH4APwAAAAB+AD4AAAAAPAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DRAcHBwcHBwcHBwcDQ=="), 56+(scale<<8)+(1<<16));
  return this;
};

Graphics.prototype.setFontRoboto20 = function(scale) {
  // Actual height 21 (20 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAH/zA/+YAAAAAAAHwAAwAAHwAA+AAAAAAAAAAAQACDAAYbADP4B/8A/zAGYZADH4A/+A/7AHYYADCAAAAAAAQAeHgH4eBzgwMMHnhw88GGBw4wHj+AcPgAAAAAAAAAAB4AA/gAGMAAwhwGMcAfuABzgABzgAc+AOMYBhBAAMYAB/AAHwAAAAAHwD5+A/8YGPDAw8YGPzA/HYD4fAADwAB/AAOYAABAAAAHwAA4AAAAAAAAAAH/gD//B8A+cAA7AADAAAAAAAYAAbwAHHgHwf/4A/8AAAAEAABiAAGwAA8AA/AAH+AAGwAByAAEAAAAAAAMAABgAAMAABgAH/wA/+AAMAABgAAMAABgAAAAAAAIAAfAADwAAAABgAAMAABgAAMAABgAAAAAAAAAAAAADAAAYAAAAAAAAADgAB8AB+AA+AA+AA/AAHAAAgAAAAAAB8AB/8Af/wHAHAwAYGADAwAYHAHAf/wB/8AAAAAAAAAAABgAAcAADAAAYAAH//A//4AAAAAAAAAAAAAAAAAAAAABwDAeA4HAPAwHYGBzAwcYHHDAfwYB8DAAAYAAAAAAABgOAcBwHADAwwYGGDAwwYHPHAf/wB58AAAAAAAAADAAB4AAfAAPYAHjAB4YA8DAH//A//4AAYAADAAAAAAAAAEMA/xwH+HAxgYGMDAxgYGODAw/4GD+AAHAAAAAAAAAf8AP/wD2HA5wYGMDAxgYGOHAA/wAD8AAAAAAAAAAAGAAAwAAGADAwB4GB+Aw+AGfAA/gAHwAAwAAAAAAADAB5+Af/wHPDAwwYGGDAwwYHPHAfvwB58AAAAAAAAAAAB+AAf4AHDjAwMYGBjAwM4HDOAf/gB/4AAAAAAAAAAAAYDADAYAAAAAAAAAAYDAfAYHwAAAABAAAcAADgAA+AAGwAB3AAMYABjgAYMAAAAAAAAAAAAAAABmAAMwABmAAMwABmAAMwABmAAMwAAiAAAAAAAAAYMADjgAMYAB3AAGwAA2AADgAAcAABAAAAAAAAAMAADgAA4AAGBzAweYGHAA/wAD8AAEAAAAwAB/4A/PwOAGDgAYYPxmH/Mw4ZmMDMxgZmM+Mx/5mHDAYAIDgDAPBwAf8AAMAAAAAAAYAAfAAPwAP4AH+AH4wA8GAH4wAP2AAPwAAfwAAfAAAYAAAAAAAAAAA//4H//AwwYGGDAwwYGGDAwwYH/HAf/wB58AAAAADAAH/AD/+AcBwHADAwAYGADAwAYGADA4A4DweAODgAAAAAAAAAAAAAAH//A//4GADAwAYGADAwAYGADAYAwD4+AP/gAfwAAAAAAAAAAAH//A//4GDDAwYYGDDAwYYGDDAwYYGCDAgAYAAAAAAAH//A//4GDAAwYAGDAAwYAGDAAwYAGAAAAAAAAAAH/AD/8AcBwHAHAwAYGADAwYYGDDA4YYDz/AOfwAAAAAAAAAAA//4H//A//4ADAAAYAADAAAYAADAAAYAADAA//4H//AAAAAAAAAAAAAAA//4H//AAAAAAAAABAAAeAAB4AADAAAYAADAAAYAAHA//wH/8AAAAAAAAAAAAAAA//4H//AAcAAPAAD4AA/wAOPADg8A4B4GAHAgAYAAAAAAAH//A//4AADAAAYAADAAAYAADAAAYAADAAAAAAAA//4H//A+AAB+AAD8AAD8AAH4AAPAAH4AH4AD8AD8AA+AAH//A//4AAAAAAAH//A//4H//AeAAB8AADwAAPgAAeAAA8AADwH//A//4AAAAAAAAAAAH/AB/8AeDwHAHAwAYGADAwAYGADA4A4DweAP/gA/4AAAAAAAAAAAH//A//4GBgAwMAGBgAwMAGBgAwcAH/AAfwAA8AAAAAA/4AP/gDgOA4A4GADAwAYGADAwAYHAHgeD+B/8wD+GAAAAAAAAAAA//4H//AwYAGDAAwYAGDgAweAHH8Afz4B8HAAAIAAYAPDwD8OA5w4GGDAwwYGHDAwYYHDnAePwBw8AAAAGAAAwAAGAAAwAAGAAA//4H//AwAAGAAAwAAGAAAwAAAAAAAAAH/4A//wAAPAAAYAADAAAYAADAAAYAAPA//wH/8AAAAAAAAgAAHAAA/AAB/AAD+AAD+AAD4AAfAAfwAfwAfwAH4AA4AAEAAA+AAH/AAH/gAD/AAD4AD+AH+AH8AA+AAH+AAD+AAD/AAD4AH/AP/AH+AA8AAAAAAAAAGADA4A4HweAPPgA/wAB8AAfwAPvgDweA8B4GADAAAIGAAA4AAHwAAPgAAfAAA/4AH/AD4AB8AA+AAHgAAwAAAAAAAAAGADAwB4GAfAwPYGDzAx4YGeDA/AYHwDA4AYGADAAAAAAAA///3//+wAA2AAGAAAGAAA+AAD8AAD8AAD4AAH4AAHgAAMAAAAwAA2AAG///3//+AAAAAAAAAAAOAAHwAD4AA8AAD8AADwAAGAAAAAAABgAAMAABgAAMAABgAAMAABgAAMAABgAAAEAAAwAADAAAIAAAAAAAAAAEeABn4Ad3ADMYAZjADMYAZmAB/4AP/AAAAAAAA//4H//ABgwAYDADAYAYDADg4AP+AA/gABwAAAAAAAAA/gAP+ADg4AYDADAYAYDADAYAOOABxwAAAAAEAAH8AB/wAcHADAYAYDADAYAcDA//4H//AAAAAAAAAAAAH8AB/wAdnADMYAZjADMYAZjAB84AHmAAMAAMAABgAB//gf/8HMAAxgAGIAAAAAAH8IB/zAcHMDAZgYDMDAZgcHcD//Af/wAAAAAAAAAAH//A//4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAGf/Az/4AAAAAAAAAAMz//mf/4AAAAAAAAAAH//A//4ABwAAeAAH4ABzwAcPACAYAABAAAAAAAA//4H//AAAAAAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/ABgAAYAADAAAYAADgAAP/AA/4AAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAAH8AB/wAcHADAYAYDADAYAYDADx4AP+AA/gAAAAAAAAf/8D//gYDADAYAYDADAYAcHAB/wAH8AAEAAAAAAEAAH8AB/wAcHADAYAYDADAYAYDAD//gf/8AAAAAAAAAAAf/AD/4AcAADAAAYAACAAAAEAB5wAfnADMYAZjADGYAYzADn4AOeAAAAAAAADAAAYAAf/wD//ADAYAYDAAAAAAAAD/gAf/AAA4AADAAAYAADAAAwAf/AD/4AAAAAAAAYAAD4AAP4AAP4AAPAAH4AH4AD8AAcAAAAAAQAADwAAf4AAf4AAPAAP4AP4ADwAAfgAA/gAA/AAD4AH+AD+AAeAAAAAAAAACAYAcHADzwAH8AAfAAH8ADx4AcHACAIAcAMD4BgP4MAP/AAPwAP4AP4AD4AAcAAAAAAAAADAYAYHADD4AY7ADOYAfjADwYAcDADAYAAAAADAAA4AH//B/v8cABzAACAAAH//w//+AAAAAAACAACcAAx/n+H//AA4AAHAAAAAAAAAAAAAOAADgAAYAADAAAcAABgAAGAAAwAAGAADwAAcAAAAA"), 32, atob("BQUHDQwPDQQHBwkMBAYGCQwMDAwMDAwMDAwFBAsMCwoTDg0ODgwMDg8GDA0LEg8ODQ4NDA0ODRMNDQ0GCQYJCQYLDAsMCwcMDAUFCwUSDAwMDAcLBwwKEAoKCgcFBw4A"), 21+(scale<<8)+(1<<16));
  return this;
};

function assignPalettes() {
  if (g.theme.dark) {
    // palette for 0-40%
    pal1 = new Uint16Array([g.theme.bg, g.toColor(settings.gy), g.toColor(settings.fg), g.toColor("#00f")]);
    // palette for 50-100%
    pal2 = new Uint16Array([g.theme.bg, g.toColor(settings.fg), g.toColor(settings.gy), g.toColor("#00f")]);
  } else {
    // palette for 0-40%
    pal1 = new Uint16Array([g.theme.bg, g.theme.fg, g.toColor(settings.fg), g.toColor("#00f")]);
    // palette for 50-100%
    pal2 = new Uint16Array([g.theme.bg, g.toColor(settings.fg), g.theme.fg, g.toColor("#00f")]);
  }
}

function setSmallFont20() {
  g.setFontRoboto20();
}

function setLargeFont() {
  g.setFontBloggerSansLight46(1);
}

function setSmallFont() {
  g.setFont('Vector', 16);
}

function getSteps() {
  try {
    return Bangle.getHealthStatus("day").steps;
  } catch (e) {
    if (WIDGETS.wpedom !== undefined)
      return WIDGETS.wpedom.getSteps();
    else
      return 0;
  }
}

/////////////// sunrise / sunset /////////////////////////////

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  settings.gy = settings.gy||'#020';
  settings.fg = settings.fg||'#0f0';
  settings.idle_check = (settings.idle_check === undefined ? true : settings.idle_check);
  settings.batt_hours = (settings.batt_hours === undefined ? true : settings.batt_hours);
  assignPalettes();
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

function batteryString(){
  let stringToInsert;
  if (settings.batt_hours) {
    var batt_usage = 200000/E.getPowerUsage().total;
    let rounded;
    if (batt_usage > 24) {
      var days = Math.floor(batt_usage/24);
      var hours = Math.round((batt_usage/24 - days) * 24);
      stringToInsert = '\n' + days + ((days < 2) ? 'd' : 'ds') + ' ' + hours + ((hours < 2) ? 'h' : 'hs');
    }
    else if (batt_usage > 9) {
      rounded = Math.round(200000/E.getPowerUsage().total * 10) / 10;
    }
    else {
      rounded = Math.round(200000/E.getPowerUsage().total * 100) / 100;
    }
    if (batt_usage < 24) {
      stringToInsert = '\n' + rounded + ' ' + ((batt_usage < 2) ? 'h' : 'hs');
    }
  }
  else{
    stringToInsert = ' ' + E.getBattery() + '%';
  }
  return 'BATTERY' + stringToInsert;
}

const infoData = {
  ID_DATE:  { calc: () => {var d = (new Date()).toString().split(" "); return d[2] + ' ' + d[1] + ' ' + d[3];} },
  ID_DAY:   { calc: () => {var d = require("locale").dow(new Date()).toLowerCase(); return d[0].toUpperCase() + d.substring(1);} },
  ID_SR:    { calc: () => 'SUNRISE ' + sunRise },
  ID_SS:    { calc: () => 'SUNSET ' + sunSet },
  ID_STEP:  { calc: () => 'STEPS ' + getSteps() },
  ID_BATT:  { calc: batteryString},
  ID_HRM:   { calc: () => hrmCurrent }
};

const infoList = Object.keys(infoData).sort();
let infoMode = infoList[0];

function nextInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === infoList.length - 1) infoMode = infoList[0];
    else infoMode = infoList[idx + 1];
  }
  // power HRM on/off accordingly
  Bangle.setHRMPower(infoMode == "ID_HRM" ? 1 : 0);
  resetHrm();
}

function prevInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === 0) infoMode = infoList[infoList.length - 1];
    else infoMode = infoList[idx - 1];
  }
  // power HRM on/off accordingly
  Bangle.setHRMPower(infoMode == "ID_HRM" ? 1 : 0);
  resetHrm();
}

function clearInfo() {
  g.setColor(g.theme.bg);
  //g.setColor(g.theme.fg);
  g.fillRect((w/2) - infoWidth, infoLine - infoHeight, (w/2) + infoWidth, infoLine + infoHeight);
}

function drawInfo() {
  clearInfo();
  g.setColor(g.theme.fg);
  setSmallFont();
  g.setFontAlign(0,0);

  if (infoMode == "ID_HRM") {
    clearInfo();
    g.setColor('#f00'); // red
    drawHeartIcon();
  } else {
    g.drawString((infoData[infoMode].calc().toUpperCase()), w/2, infoLine);
  }
}

function drawHeartIcon() {
  g.drawImage(hrmImg, (w/2) - infoHeight - 20, infoLine - infoHeight);
}

function drawHrm() {
  if (idle) return; // dont draw while prompting
  var d = new Date();
  clearInfo();
  g.setColor(d.getSeconds()&1 ? '#f00' : g.theme.bg);
  drawHeartIcon();
  setSmallFont();
  g.setFontAlign(-1,0); // left
  g.setColor(hrmConfidence >= 50 ? g.theme.fg : '#f00');
  g.drawString(hrmCurrent, (w/2) + 10, infoLine);
}

function draw() {
  if (!idle)
    drawClock();
  else
    drawIdle();
  queueDraw();
}

function drawClock() {
  var date = new Date();
  //var timeStr = require("locale").time(date,1);
  var da = date.toString().split(" ");
  //var time = da[4].substr(0,5);
  var hh = da[4].substr(0,2);
  var mm = da[4].substr(3,2);
  var steps = getSteps();
  var p_steps = Math.round(100*(steps/10000));

  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(0, 0, w, h);
  g.drawImage(getGaugeImage(p_steps), 0, 0);
  setLargeFont();

  g.setColor(settings.fg);
  g.setFontAlign(1,0);  // right aligned
  g.drawString(hh, (w/2) - 1, h/2);

  g.setColor(g.theme.fg);
  g.setFontAlign(-1,0); // left aligned
  g.drawString(mm, (w/2) + 1, h/2);

  drawInfo();

  // recalc sunrise / sunset every hour
  if (drawCount % 60 == 0)
    updateSunRiseSunSet(new Date(), location.lat, location.lon);
  drawCount++;
}

function drawSteps() {
  if (drawingSteps) return;
  drawingSteps = true;
  clearInfo();
  setSmallFont();
  g.setFontAlign(0,0);
  g.setColor(g.theme.fg);
  g.drawString('STEPS ' + getSteps(), w/2, (3*h/4) - 4);
  drawingSteps = false;
}

/////////////////   GAUGE images /////////////////////////////////////

var hrmCurrent = "--";
var hrmConfidence = 0;

function resetHrm() {
  hrmCurrent = "--";
  hrmConfidence = 0;
  if (infoMode == "ID_HRM") {
    clearInfo();
    g.setColor('#f00'); // red
    drawHeartIcon();
  }
}

Bangle.on('HRM', function(hrm) {
  hrmCurrent = hrm.bpm;
  hrmConfidence = hrm.confidence;
  log_debug("HRM=" + hrm.bpm + " (" + hrm.confidence + ")");
  if (infoMode == "ID_HRM" ) drawHrm();
});


/////////////////   GAUGE images /////////////////////////////////////


// putting into 1 function like this, rather than individual variables
// reduces ram usage from 70%-13%
function getGaugeImage(p) {
  // p0
  if (p < 2) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal1,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVAAVUFUgpDAAdAFMEBFQ4ABqBVnLMQqLLLzWEABLgbVgohEGopYaiofDBihWVHJpYYDgYPbKx1ACJhYZIwT4OcAZWYHyRYUIgQXQH4RqOThCXUYRpCHNyQVVQQTwVQiSZWIQSEQNgSYSIYiEQQSyEUCQLDSOAyCnQiSCYQiSCYQiSCZDaDARObKuBSZwcaVzR0QFYKuZWAYNZWCJJKMoKuaWAahKBhiwTJRSudURorBFTgfMVzqjDO5DaeZ5jaeJhhiKbi4rIbT4hLqoriPI7afUpS5BbTwiKFdZgIADSmHFYIqgbgIrGcgIriEYwzHADZ7HRY4rdaYrjHADcBFYoGBFcgkEGQwAeFYqKHFbzUEcQ4AdiorwiorlEogxFAD59FWoorhoArDqArjgIr/FbYwFAEJSDFf4rXgornqgrDFUkAior/Ff4rGAYYAjKYYr/Ff4r/FbdVFdFAFYNQFcsBFf4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/FbdUFcsFFYUVFdADBFf4r/Ff4rbAYYAjKYYr/Ff4rFoArkqorCgIrnqAr/FbIEFAEBSFFf4rYqgrjgorEiormAocVAogAfEooxFFcB9EFdq1DAD9VFYkBFctQFYoGEADokHFcp8FRQoAdag7iFFb4HFioHGADYjHGY4rcPYyLHADbTHcYNQFT4iIFdZgIADKmJqrcgiorIBIIrhMKIAXUpIrBbjzaBFZAKKbS5MJFcKkJbj4fLBYLcdqorKbjzPMbjxKNMhauTURawdJJorBWDShBFZiRBWDQcOHRyuPOhorBWDIbPWDRzQSYKEYIwLLOHgSEXDIJyPQjD2SQjCCQQjSCRCYY/QN4xDRQiyCSQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A"))
  };

  // p2
  if (p >= 2 && p < 4) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette: pal1,
    buffer : require("heatshrink").decompress(atob("AH4A/ADNUFE8FqtVq2q1AqkFIIrDAAOAFMEBFQYrE1WgKsYrGLL4qFFY2pqDWeFZdUVkAhCAQMKFYdVLDUVFQYMHlWq0oMJKyoOJlQrCLDBWDB5clB5xWOoARMCARYWKwT4OgpYXKwY+SLChECC6A/CNRycIS6jCNIQ5uSCqqCCeCqESTKxCCQiBsCTCRDEQiCCWQigSBYaRwGQU6ESQTCESQTCESQTIbQYCJzZVwKTODjSuaOiArBVzKwDBrKwRJJRlBVzSwDUJQMMWCZKKVzqiNFYIqcD5iudUYZ3IbTzPMbTxMMMRTcXFZDafEJdVFcR5HbT6lKXILaeERQrrMBAAaUw4rBFUDcBFYzkBFcQjGGY4AbPY6LHFbrTFcY4AbgIrFAwIrkEggyGADwrFRQ4reagjiHADsVFeEVFcolEGIoAfPoq1FFcNAFYdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHI"))
  };

  // p4
  if (p >= 4 && p < 7) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal1,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFY2loAqjFY1VqDWeFZdUVkAhEhQrDLDcVFQYMHlQrCBhBWVHJpYYDgYPbKx1ACJhYZIwT4OgpYXKwY+SLChECC6A/CNRycIS6jCNIQ5uSCqqCCeCqESTKxCCQiBsCTCRDEQiCCWQigSBYaRwGQU6ESQTCESQTCESQTIbQYCJzZVwKTODjSuaOiArBVzKwDBrKwRJJRlBVzSwDUJQMMWCZKKVzqiNFYIqcD5iudUYZ3IbTzPMbTxMMMRTcXFZDafEJdVFcR5HbT6lKXILaeERQrrMBAAaUw4rBFUDcBFYzkBFcQjGGY4AbPY6LHFbrTFcY4AbgIrFAwIrkEggyGADwrFRQ4reagjiHADsVFeEVFcolEGIoAfPoq1FFcNAFYdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHI"))
  };

  // p7
  if (p >= 7 && p < 10) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal1,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgWlKzVACJgrCqBWYawgAJcAOlNBhWMCZ8qFYJYUgoqBC6ECFYJqOAApWSS4jCNQQ5uSCqqCCeCqESFQKZUIQSEQNgSYSIYiEQQSyEUCQLDSOAyCnQiSCYQiSCYQiSCZDaDARObKuBSZwcaVzR0QFYKuZWAYNZWCJJKMoKuaWAahKBhiwTJRSudURorBFTgfMVzqjDO5DaeZ5jaeJhhiKbi4rIbT4hLqoriPI7afUpS5BbTwiKFdZgIADSmHFYIqgbgIrGcgIriEYwzHADZ7HRY4rdaYrjHADcBFYoGBFcgkEGQwAeFYqKHFbzUEcQ4AdiorwiorlEogxFAD59FWoorhoArDqArjgIr/FbYwFAEJSDFf4rXgornqgrDFUkAior/Ff4rGAYYAjKYYr/Ff4r/FbdVFdFAFYNQFcsBFf4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/FbdUFcsFFYUVFdADBFf4r/Ff4rbAYYAjKYYr/Ff4rFoArkqorCgIrnqAr/FbIEFAEBSFFf4rYqgrjgorEiormAocVAogAfEooxFFcB9EFdq1DAD9VFYkBFctQFYoGEADokHFcp8FRQoAdag7iFFb4HFioHGADYjHGY4rcPYyLHADbTHcYNQFT4iIFdZgIADKmJqrcgiorIBIIrhMKIAXUpIrBbjzaBFZAKKbS5MJFcKkJbj4fLBYLcdqorKbjzPMbjxKNMhauTURawdJJorBWDShBFZiRBWDQcOHRyuPOhorBWDIbPWDRzQSYKEYIwLLOHgSEXDIJyPQjD2SQjCCQQjSCRCYY/QN4xDRQiyCSQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A=="))
  };

  // p10
  if (p >= 10 && p < 20) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal1,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgZWaoARMLDJWCawgAJcAZWYCZ6FCLCkFFQNQCZ8CFYOoFaZWSLAmAQShWQLAiESQQRtTLAOkQSdUFacK1WloCCSCaAAEFYKaQQSyEC0pvQirZTbomlIh6CYZAZFOQTBxDQhyCYOQhoPQS4bQHaBzaVwKTODjSuaOiArBVzKwDBrKwRJJRlBVzSwDUJQMMWCZKKVzqiNFYIqcD5iudUYZ3IbTzPMbTxMMMRTcXFZDafEJdVFcR5HbT6lKXILaeERQrrMBAAaUw4rBFUDcBFYzkBFcQjGGY4AbPY6LHFbrTFcY4AbgIrFAwIrkEggyGADwrFRQ4reagjiHADsVFeEVFcolEGIoAfPoq1FFcNAFYdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHI"))
  };

  // p20
  if (p >= 20 && p < 30) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal1,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgZWaoARMLDJWCawgAJcAZWYCZ6FCLCkFFQNQCZ8CFYOoFaZWSLAmAQShWQLAiESQQRtTLAKESFQNUFacKQiSCCoArTgCESQSyEUirZTboyCnQiSCYQiSCYQiSCZQgeAVxwqYQgSwMVwNUFbMKWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbhdVFcTcHbT7cDFY0BbT7cD0ArxgtVoArfgGq1ArHFUDcBFY0VFceqFY1UFcMKFY1VFcmAFYtQFcMCFYsBFcugFYtAFcMAFYsFFcuoFYoqigEqFeEVFcuqFYlUFccKFYlVFc2AFYdQFccCFf4AWgNVoAEGAERSDFf4rXgornqgrDFUkAior/Ff4rGAYYAjKYYr/Ff4r/FbdVFdFAFYNQFcsBFf4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/FbdUFcsFFYUVFdADBFf4r/Ff4rbAYYAjKYYr/Ff4rFoArkqorCgIrnqAr/FbIEFAEBSFFf4rYqgrjgorEiormAocVAogAfEooxFFcB9EFdq1DAD9VFYkBFctQFYoGEADokHFcp8FRQoAdag7iFFb4HFioHGADYjHGY4rcPYyLHADbTHcYNQFT4iIFdZgIADKmJqrcgiorIBIIrhMKIAXUpIrBbjzaBFZAKKbS5MJFcKkJbj4fLBYLcdqorKbjzPMbjxKNMhauTURawdJJorBWDShBFZiRBWDQcOHRyuPOhorBWDIbPWDRzQSYKEYIwLLOHgSEXDIJyPQjD2SQjCCQQjSCRCYY/QN4xDRQiyCSQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A="))
  };

  // p30
  if (p >= 30 && p < 40) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal1,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgZWaoARMLDJWCawgAJcAZWYCZ6FCLCkFFQNQCZ8CFYOoFaZWSLAmAQShWQLAiESQQRtTLAKESFQNUFacKQiSCCoArTgCESQSyEUirZTboyCnQiSCYQiSCYQiSCZQgeAVxwqYQgSwMVwNUFbMKWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbhdVFcTcHbT7cDFY0BbT7cD0ArxgtVoArfgGq1ArHFUDcBFY0VFceqFY1UFcMKFY1VFcmAFYtQFcMCFYsBFcugFYtAFcMAFYsFFcuoFYoqigEqFeEVFcuqFYlUFccKFYlVFc2AFYdQFccCFf4rbgNVoArjgGq0Ar/FbMFFc+oFYYqkgEqFf4r/FY0VqgrlhWqFf4r/Ff4rdqorowArBqArlgQr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlhQrCioroAYIr/Ff4r/FbcFqorllWoFf4r/FY9AFcmqFYUBFc+gFf4rZgFVqAqjgWqwAr/FbdUFccFawkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHI"))
  };

  // p40
  if (p >= 40 && p < 50) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal1,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgZWaoARMLDJWCawgAJcAZWYCZ6FCLCkFFQNQCZ8CFYOoFaZWSLAmAQShWQLAiESQQRtTLAKESFQNUFacKQiSCCoArTgCESQSyEUirZTboyCnQiSCYQiSCYQiSCZQgeAVxwqYQgSwMVwNUFbMKWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbhdVFcTcHbT7cDFY0BbT7cD0ArxgtVoArfgGq1ArHFUDcBFY0VFceqFY1UFcMKFY1VFcmAFYtQFcMCFYsBFcugFYtAFcMAFYsFFcuoFYoqigEqFeEVFcuqFYlUFccKFYlVFc2AFYdQFccCFf4rbgNVoArjgGq0Ar/FbMFFc+oFYYqkgEqFf4r/FY0VqgrlhWqFf4r/Ff4rdqorowArBqArlgQr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlhQrCioroAYIr/Ff4r/FbcFqorllWoFf4r/FY9AFcmqFYUBFc+gFf4rZgFVqAqjgWqwAr/FbdUFccKFYkVFcwFDitVFccqFYkFFcuoFeNAFcWqFYkBFcugFYtQFUMCFYsAFcuAFYtUFcMKFY0VFcgHFitVFcMqFY0FFceoFY9AFcGqFY0BqtQFT8C1WgFeMAqtUFb8K1WAFY7cglQrIioriBI8FqtAFb2q1ArJbjzaBFZEBbj7aB0ALIFcLaHbkLaJFYbcd1QrKbjzaKbkDaLbgSwcVwLaJWD6uLFYawaVwIrMbgKwaVwLaKbgawaVwLaLbgawZQQLaLWDiuOWAaEYQQKuMWAiEXKwKuNQjUBQR6EaiqCPQjVVQSATCqtUFSZvB1WACiSEUY4KCQQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A"))
  };

  // p50
  if (p >= 50 && p < 60) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal2,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESFQOoFacFQiSCCwArTgCESQSyEUlTZTboyCnQiSCYQiSCYQiSCZQgdAVxwqYQgSwMVwOoFbMFWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbheqFcTcHbT7cDFY0CbT7cDqArxhWqwArfgFVqgrHFUDcBFY0qFcdVFY2oFcMFFY2qFclAFYugFcMBFYsCFctQFYuAFcMAFYsKFctUFYoqigEVFeEqFctVFYmoFccFFYmqFc1AFYegFccBFf4rbgWqwArjgFVqAr/FbMKFc9UFYYqkgEVFf4r/FY0q1ArlgtVFf4r/Ff4rd1QrooArB0ArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rb1ArlgorClQroAYIr/Ff4r/FbcK1QrlitUFf4r/FY+AFclVFYUCFc9QFf4rZgGq0AqjgNVoAr/FbeoFccFFYkqFcwFDlWqFccVFYkKFctUFeOAFcVVFYkCFctQFYugFUMBFYsAFctAFYuoFcMFFY0qFcgHFlWqFcMVFY0KFcdUFY+AFcFVFY0C1WgFT8BqtQFeMA1WoFb8FqtAFY7cgiorIlQriBI8K1WAFb1VqgrJbjzaBFZECbj7aBqALIFcLaHbkLaJFYbcdqorKbjzaKbkDaLbgSwcVwLaJWD6uLFYawaVwIrMbgKwaVwLaKbgawaVwLaLbgawZQQLaLWDiuOWAaEYQQKuMWAiEXKwKuNQjSCQQjSCQQjSCRAAIrB1AqTgorBoAUQQiyCSQgjdSbISCRQgZYSKwKCSQghYQKwSCSQghYQKwSCTAAMqFYOoCJsFFQNVFShYEwARMFQRWVLAiFMQIRWWLAosKFQZWXLAosIFQZWYLAzgFawZWbAAMKFgmq1IoEAANUFTQABFZtAFbgsFFYwqeWQorFVjZZJFYhVfcAwrCazoA/AHI"))
  };

  // p60
  if (p >= 60 && p < 70) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal2,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESFQOoFacFQiSCCwArTgCESQSyEUlTZTboyCnQiSCYQiSCYQiSCZQgdAVxwqYQgSwMVwOoFbMFWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbheqFcTcHbT7cDFY0CbT7cDqArxhWqwArfgFVqgrHFUDcBFY0qFcdVFY2oFcMFFY2qFclAFYugFcMBFYsCFctQFYuAFcMAFYsKFctUFYoqigEVFeEqFctVFYmoFccFFYmqFc1AFYegFccBFf4rbgWqwArjgFVqAr/FbMKFc9UFYYqkgEVFf4r/FY0q1ArlgtVFf4r/Ff4rd1QrooArB0ArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rb1ArlgorClQroAYIr/Ff4r/FbcK1QrlitUFf4r/FY+AFclVFYUCFc9QFf4rZgGq0AqjgNVoAr/FbeoFccFFYkqFcwFDlWqFccVFYkKFctUFeOAFcVVFYkCFctQFYugFUMBFYsAFctAFYuoFcMFFY0qFcgHFlWqFcMVFY0KFcdUFY+AFcFVFY0C1WgFT8BqtQFeMA1WoFb8FqtAFY7cgiorIlQriBI8K1WAFb1VqgrJbjzaBFZECbj7aBqALIFcLaHbkLaJFYbcdqorKbjzaKbkDaLbgSwcVwLaJWD6uLFYawaVwIrMbgKwaVwLaKbgawaVwLaLbgawZQQLaLWDiuOWAaEYQQKuMWAelNBqCLVxqEC0oRPQS6EC0oSQQSyECFYKEVQSIABFYI/QAAcFFYJDRCgSCmYYjdSCqqYCLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A"))
  };

  // p70
  if (p >= 70 && p < 80) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal2,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESFQOoFacFQiSCCwArTgCESQSyEUlTZTboyCnQiSCYQiSCYQiSCZQgdAVxwqYQgSwMVwOoFbMFWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbheqFcTcHbT7cDFY0CbT7cDqArxhWqwArfgFVqgrHFUDcBFY0qFcdVFY2oFcMFFY2qFclAFYugFcMBFYsCFctQFYuAFcMAFYsKFctUFYoqigEVFeEqFctVFYmoFccFFYmqFc1AFYegFccBFf4rbgWqwArjgFVqAr/FbMKFc9UFYYqkgEVFf4r/FY0q1ArlgtVFf4r/Ff4rd1QrooArB0ArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rb1ArlgorClQroAYIr/Ff4r/FbcK1QrlitUFf4r/FY+AFclVFYUCFc9QFf4rZAgoAggNVoAr/FbdUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHIA="))
  };

  // p80
  if (p >= 80 && p < 90) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal2,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESFQOoFacFQiSCCwArTgCESQSyEUlTZTboyCnQiSCYQiSCYQiSCZQgdAVxwqYQgSwMVwOoFbMFWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbheqFcTcHbT7cDFY0CbT7cDqArxhWqwArfgFVqgrHFUDcBFY0qFcdVFY2oFcMFFY2qFclAFYugFcMBFYsCFctQFYuAFcMAFYsKFctUFYoqigEVFeEqFctVFYmoFccFFYmqFc1AcIdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHIA="))
  };

  // p90
  if (p >= 90 && p < 100) return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal2,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESquq1ArTgqESNgOqwArTIYKERH4KCUQigSBbKTdGCKKCVQiTCCFSyERCALBQQjAPBoArXDZ7ARObKuBSZwcaVzR0QFYKuZWAYNZWCJJKMoKuaWAahKBhiwTJRSudURorBFTgfMVzqjDO5DaeZ5jaeJhhiKbi4rIbT4hLqoriPI7afUpS5BbTwiKFdZgIADSmHFYIqgbgIrGcgIriEYwzHADZ7HRY4rdaYrjHADcBFYoGBFcgkEGQwAeFYqKHFbzUEcQ4AdiorwiorlEogxFAD59FWoorhoArDqArjgIr/FbYwFAEJSDFf4rXgornqgrDFUkAior/Ff4rGAYYAjKYYr/Ff4r/FbdVFdFAFYNQFcsBFf4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/FbdUFcsFFYUVFdADBFf4r/Ff4rbAYYAjKYYr/Ff4rFoArkqorCgIrnqAr/FbIEFAEBSFFf4rYqgrjgorEiormAocVAogAfEooxFFcB9EFdq1DAD9VFYkBFctQFYoGEADokHFcp8FRQoAdag7iFFb4HFioHGADYjHGY4rcPYyLHADbTHcYNQFT4iIFdZgIADKmJqrcgiorIBIIrhMKIAXUpIrBbjzaBFZAKKbS5MJFcKkJbj4fLBYLcdqorKbjzPMbjxKNMhauTURawdJJorBWDShBFZiRBWDQcOHRyuPOhorBWDIbPWDRzQSYKEYIwLLOHgSEXDIJyPQjD2SQjCCQQjSCRCYY/QN4xDRQiyCSQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A"))
  };

  // p100
  return {
    width : 176, height : 176, bpp : 2,
    transparent : -1,
    palette : pal2,
    buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVAAVUFUgpDAAdAFMEBFQ4ABqBVnLMQqLFjzWEABLgbVgohEGoqyaiofDBihWVHJpYYDgYPbKxz5NLDJGCfBzgDKzA+SLChECC6A/CNRycIS6jCNIQ5uSCqqCCeCqESTKxCCQiBsCTCRDEQiCCWQigSBYaRwGQU6ESQTCESQTCESQTIbQYCJzZVwKTODjSuaOiArBVzKwDBrKwRJJRlBVzSwDUJQMMWCZKKVzqiNFYIqcD5iudUYZ3IbTzPMbTxMMMRTcXFZDafEJdVFcR5HbT6lKXILaeERQrrMBAAaUw4rBFUDcBFYzkBFcQjGGY4AbPY6LHFbrTFcY4AbgIrFAwIrkEggyGADwrFRQ4reagjiHADsVFeEVFcolEGIoAfPoq1FFcNAFYdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHIA="))
  };
}

/////////////////   IDLE TIMER /////////////////////////////////////

function drawIdle() {
  let mins = Math.round((getTime() - lastStep) / 60);
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);
  g.setColor(g.theme.fg);
  setSmallFont20();
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
  setSmallFont20();
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
  var x = xy.x;
  var y = xy.y;
  // adjust for outside the dimension of the screen
  // http://forum.espruino.com/conversations/371867/#comment16406025
  if (y > h) y = h;
  if (y < 0) y = 0;
  if (x > w) x = w;
  if (x < 0) x = 0;

  if (idle && dismissBtn.check(x, y)) return;
});

// if we get a step then we are not idle
Bangle.on('step', s => {
  lastStep = getTime();
  // redraw if we had been idle
  if (idle == true) {
    dismissPrompt();
  }
  idle = false;
  warned = 0;

  if (infoMode == "ID_STEP") drawSteps();
});

function checkIdle() {
  log_debug("checkIdle()");
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
loadLocation();

g.clear();
Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 */
widget_utils.hide();
draw();
