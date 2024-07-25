const storage = require('Storage');
const locale = require("locale");

const font12 = g.getFonts().includes("12x20");
const font = font12 ? "12x20" : "6x8";
const fontsize = font12 ? 1: 2;
const fontheight = 19;

const marginTop = 5;
const marginLeftTopic = 3; // margin of topics
const marginLeftData = font12 ? 64 : 75; // margin of data values

const topicColor = g.theme.dark ? "#fff" : "#000";
const textColor = g.theme.dark ? "#0f0" : "#080";
const textColorRed = g.theme.dark ? "#FF0000" : "#FF0000";

let hrtValue;
let hrtValueIsOld = false;

//let localTempValue;
//let weatherTempString;
let lastHeartRateRowIndex;
let lastStepsRowIndex;
let i = 2;

let settings;

function loadSettings() {
  settings = storage.readJSON('clicompleteclk.json', 1) || {};
}

function setting(key) {
  if (!settings) { loadSettings(); }
  const DEFAULTS = {
    'battery': true,
    'batteryLvl': 30,
    'weather': true,
    'steps': true,
    'heartrate': true
  };
  return (key in settings) ? settings[key] : DEFAULTS[key];
}


let showBattery = setting('battery');
let batteryWarnLevel = setting('batteryLvl');
let showWeather = setting('weather');
let showSteps = setting('steps');
let showHeartRate = setting('heartrate');


var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    drawAll(true);
  }, 60000 - (Date.now() % 60000));
}

function drawAll(drawInfoToo){
  let now = new Date();
  updateTime(now);
  if (drawInfoToo) {
    drawInfo(now);
  }
  queueDraw();
}

function updateTime(now){
  if (!Bangle.isLCDOn()) return;
  writeLineTopic("TIME", 1);
  writeLine(locale.time(now,1),1);
}

function drawInfo(now) {
  if (now == undefined)
    now = new Date();

  i = 2;

  writeLineTopic("DOWK", i);
  writeLine(locale.dow(now),i);
  i++;

  writeLineTopic("DATE", i);
  writeLine(locale.date(now,1),i);
  i++;

  if (showBattery) {
    writeLineTopic("BATT", i);
    const b = E.getBattery();
    writeLine(b + "%", i, b < batteryWarnLevel ? textColorRed : textColor);
    i++;
  }

  if (showWeather) {
    drawWeather();
  }

  if (showSteps) {
    drawSteps(i);
    i++;
  }

  if (showHeartRate) {
    drawHeartRate(i);
  }
}

function drawWeather() {
  const weatherJson = getWeather();
  if(weatherJson && weatherJson.weather){
    const currentWeather = weatherJson.weather;

    const weatherTempValue = locale.temp(currentWeather.temp-273.15);
    //weatherTempString = weatherTempValue;
    writeLineTopic("WTHR", i);
    writeLine(currentWeather.txt,i);
    i++;

    writeLineTopic("TEMP", i);
    writeLine(weatherTempValue,i);
    i++;
  }
}

function drawSteps(i) {
  if (!showSteps) return;
  if (i == undefined)
    i = lastStepsRowIndex;
  const steps = getSteps();
  if (steps != undefined) {
    writeLineTopic("STEP", i);
    writeLine(steps, i);
  }
  lastStepsRowIndex = i;
}

function drawHeartRate(i) {
  if (!showHeartRate) return;
  if (i == undefined)
    i = lastHeartRateRowIndex;
  writeLineTopic("HRTM", i);
  if (hrtValue != undefined) {
    if (!hrtValueIsOld)
      writeLine(hrtValue,i);
    else
      writeLine(hrtValue,i, topicColor);
  }
  lastHeartRateRowIndex = i;
}


function writeLineTopic(str, line) {
  var y = marginTop+line*fontheight;
  g.setFont(font,fontsize);
  g.setColor(topicColor).setFontAlign(-1,-1);

  g.clearRect(0,y,g.getWidth(),y+fontheight-1);
  g.drawString("[" + str + "]",marginLeftTopic,y);
}

function writeLine(str,line,pColor){
  if (pColor == undefined)
    pColor = textColor;
  var y = marginTop+line*fontheight;
  g.setFont(font,fontsize);
  g.setColor(pColor).setFontAlign(-1,-1);
  g.drawString(str,marginLeftData,y);
}


function getSteps() {
  var steps = 0;
  let health;
  try {
    health = require("health");
  } catch (e) {
    // Module health not found
  }
  if (health != undefined) {
    health.readDay(new Date(), h=>steps+=h.steps);
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom.getSteps();
  } else if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom.getSteps();
  }
  return steps;
}

function getWeather() {
  let jsonWeather = storage.readJSON('weather.json');
  return jsonWeather;
}

// EVENTS:

// turn on HRM when the LCD is unlocked
Bangle.on('lock', function(isLocked) {
  if (!isLocked) {
    if (showHeartRate) {
      Bangle.setHRMPower(1,"clicompleteclk");
      if (hrtValue == undefined)
        hrtValue = "...";
      else
        hrtValueIsOld = true;
    }
  } else {
    if (showHeartRate) {
      hrtValueIsOld = true;
      Bangle.setHRMPower(0,"clicompleteclk");
    }
  }
  // Update steps and heart rate
  drawSteps();
  drawHeartRate();
});

Bangle.on('lcdPower',function(on) {
  if (on) {
    drawAll(true);
  } else {
    if (showHeartRate) {
      hrtValueIsOld = true;
    }
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

if (showHeartRate) {
  Bangle.on('HRM', function(hrm) {
    //if(hrm.confidence > 90){
      hrtValueIsOld = false;
      hrtValue = hrm.bpm;
      if (Bangle.isLCDOn())
        drawHeartRate();
    //} else {
    //  hrtValue = undefined;
    //}
  });
}

g.clear();
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
loadSettings();
drawAll(true);
