const storage = require('Storage');
const locale = require("locale");

const font = "12x20";
const fontsize = 1;
const fontheight = 19;

const marginTop = 10;
const marginLeftTopic = 3; // margin of topics
const marginLeftData = 68; // margin of data values

const topicColor = g.theme.dark ? "#fff" : "#000";
const textColor = g.theme.dark ? "#0f0" : "#080";

let hrtValue;
let localTempValue;
let weatherTempString;
let lastHeartRateRowIndex;

// timeout used to update every minute
var drawTimeout;
// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    drawAll(false);
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
  if(now.getMinutes() == 0)
    drawInfo(now);
}

function drawInfo(now) {
  if (now == undefined) 
    now = new Date();

  let i = 2;

  writeLineTopic("DOWK", i);
  writeLine(locale.dow(now),i);
  i++;

  writeLineTopic("DATE", i);
  writeLine(locale.date(now,1),i);
  i++;

  /*
  writeLineTopic("BAT", i);
  const b = E.getBattery();
  writeLine(b + "%", i); // TODO make bars
  i++;
  */

  // weather
  var weatherJson = getWeather();
  if(weatherJson && weatherJson.weather){
    const currentWeather = weatherJson.weather;

    const weatherTempValue = locale.temp(currentWeather.temp-273.15);
    weatherTempString = weatherTempValue;
    writeLineTopic("WTHR", i);
    writeLine(currentWeather.txt,i);
    i++;
  }

  // temperatures (local & weather)
  if (localTempValue != undefined || weatherTempString != undefined) {
    writeLineTopic("TEMP", i);
    let tempString = "";
    if (localTempValue != undefined)
      tempString += "l: " + localTempValue;
    if (tempString != "")
      tempString += ", ";
    if (weatherTempString != undefined)
      tempString += weatherTempString;
    writeLine(tempString,i);
    i++;
  }

  // steps
  if (stepsWidget() != undefined) {
    writeLineTopic("STEP", i);
    const steps = stepsWidget().getSteps();
    writeLine(steps, i);
    i++;
  }

  drawHeartRate(i);
}

function drawHeartRate(i) {
  if (hrtValue != undefined) {
    writeLineTopic("HRTM", i);
    writeLine(hrtValue,i);
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

function writeLine(str,line){
  var y = marginTop+line*fontheight;
  g.setFont(font,fontsize);
  g.setColor(textColor).setFontAlign(-1,-1);
  g.drawString(str,marginLeftData,y);
}


Bangle.on('HRM', function(hrm) {
  //if(hrm.confidence > 90){
    hrtValue = hrm.bpm + " bpm";
    if (Bangle.isLCDOn())
      drawHeartRate(lastHeartRateRowIndex);
  //} else {
  //  hrtValue = undefined;
  //}
});


function getTemperature() {
  if (Bangle.getPressure) {
    Bangle.getPressure().then(onTemperature);
  } else {
    onTemperature({
      temperature : E.getTemperature()
    });
  }
}
function onTemperature(p) {
  localTempValue = locale.temp(p.temperature.toFixed(1));
}

function stepsWidget() {
  if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom;
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom;
  }
  return undefined;
}


function getWeather() {
  let jsonWeather = storage.readJSON('weather.json');
  return jsonWeather;
}

g.clear();
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
drawAll(true);
Bangle.on('lcdPower',function(on) {
  if (on) {
    drawAll(true);
  } else {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});
