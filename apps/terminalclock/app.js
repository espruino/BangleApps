var locale = require("locale");
var fontColor = g.theme.dark ? "#0f0" : "#000";
var heartRate = 0;
var altitude = -9001;

// handling the differents versions of the Banglejs smartwatch screen sizes
if (process.env.HWVERSION == 1){
  var paddingY = 3;
  var font6x8At4Size = 48;
  var font6x8At2Size = 27;
  var font6x8FirstTextSize = 6;
  var font6x8DefaultTextSize = 3;
} else{
  var paddingY = 2;
  var font6x8At4Size = 32;
  var font6x8At2Size = 18;
  var font6x8FirstTextSize = 4;
  var font6x8DefaultTextSize = 2;
}

function setFontSize(pos){
  if(pos == 1)
    g.setFont("6x8", font6x8FirstTextSize);
  else
    g.setFont("6x8", font6x8DefaultTextSize);
}

function clearField(pos){
  var yStartPos = Bangle.appRect.y +
      paddingY * (pos - 1) +
      font6x8At4Size * Math.min(1, pos-1) +
      font6x8At2Size * Math.max(0, pos-2);
    var yEndPos = Bangle.appRect.y +
      paddingY * (pos - 1) +
      font6x8At4Size * Math.min(1, pos) +
      font6x8At2Size * Math.max(0, pos-1);
    g.clearRect(Bangle.appRect.x, yStartPos, Bangle.appRect.x2, yEndPos);
}

function clearWatchIfNeeded(now){
  if(now.getMinutes() % 10 == 0)
    g.clearRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2);
}

function drawLine(line, pos){
  setFontSize(pos);
  var yPos = Bangle.appRect.y +
      paddingY * (pos - 1) +
      font6x8At4Size * Math.min(1, pos-1) +
      font6x8At2Size * Math.max(0, pos-2);
  g.drawString(line, 5, yPos, true);
}

function drawTime(now, pos){
  var h = now.getHours();
  var m = now.getMinutes();
  var time = ">" + (""+h).substr(-2) + ":" + ("0"+m).substr(-2);
  drawLine(time, pos);
}

function drawDate(now, pos){
  var dow = locale.dow(now, 1);
  var date = locale.date(now, 1).substr(0,6) + locale.date(now, 1).substr(-2);
  var locale_date = ">" + dow + " " + date;
  drawLine(locale_date, pos);
}

function drawInput(pos){
  clearField(pos);
  drawLine(">", pos);
}

function drawStepCount(pos){
  var health = Bangle.getHealthStatus("day");
  var steps_formated = ">Steps: " + health.steps;
  drawLine(steps_formated, pos);
}

function drawHRM(pos){
  clearField(pos);
  if(heartRate != 0)
    drawLine(">HR: " + parseInt(heartRate), pos);
  else
    drawLine(">HR: unknown", pos);
}

function drawAltitude(pos){
  clearField(pos);
  if(altitude > 0)
    drawLine(">Alt: " + altitude.toFixed(1) + "m", pos);
  else
    drawLine(">Alt: unknown", pos);
}

function drawActivity(pos){
  clearField(pos);
  var health = Bangle.getHealthStatus('last');
  var steps_formated = ">Motion: " + parseInt(health.movement);
  drawLine(steps_formated, pos);
}

function draw(){
  var curPos = 1;
  g.reset();
  g.setFontAlign(-1, -1);
  g.setColor(fontColor);
  var now = new Date();
  clearWatchIfNeeded(now); // mostly to not have issues when changing days
  drawTime(now, curPos);
  curPos++;
  if(settings.showDate){
    drawDate(now, curPos);
    curPos++;
  }
  if(settings.showAltitude){
    drawAltitude(curPos);
    curPos++;
  }
  if(settings.showHRM){
    drawHRM(curPos);
    curPos++;
  }
  if(settings.showActivity){
    drawActivity(curPos);
    curPos++;
  }
  if(settings.showStepCount){
    drawStepCount(curPos);
    curPos++;
  }
  drawInput(curPos);
}

function turnOnServices(){
  if(settings.showHRM){
    Bangle.setHRMPower(true, "terminalclock");
  }
  if(settings.showAltitude && process.env.HWVERSION != 1){
    Bangle.setBarometerPower(true, "terminalclock");
  }
  if(settings.powerSaving){
    setTimeout(function () {
      turnOffServices();
    }, 45000);
  }
}

function turnOffServices(){
  if(settings.showHRM){
    Bangle.setHRMPower(false, "terminalclock");
  }
  if(settings.showAltitude && process.env.HWVERSION != 1){
    Bangle.setBarometerPower(false, "terminalclock");
  }
}

var unlockDrawIntervalID = -1;
Bangle.on('lock', function(on){
  if(!on){ // unclock
    if(settings.powerSaving){
      turnOnServices();
    }
    unlockDrawIntervalID = setInterval(draw, 1000); // every second
  }
  if(on && unlockDrawIntervalID != -1){ // lock
    clearInterval(unlockDrawIntervalID);
  }
});

Bangle.on('HRM',function(hrmInfo) {
  if(hrmInfo.confidence >= settings.HRMinConfidence)
    heartRate = hrmInfo.bpm;
});

var MEDIANLENGTH = 20; // technical
var avr = [], median; // technical
Bangle.on('pressure', function(e) {
  while (avr.length>MEDIANLENGTH) avr.pop();
  avr.unshift(e.altitude);
  median = avr.slice().sort();
  if (median.length>10) {
    var mid = median.length>>1;
    altitude = E.sum(median.slice(mid-4,mid+5)) / 9;
  }
});


// Clear the screen once, at startup
g.clear();
// load the settings
var settings = Object.assign({
  // default values
  HRMinConfidence: 50,
  showDate: true,
  showHRM: true,
  showActivity: true,
  showStepCount: true,
  showAltitude: process.env.HWVERSION != 1 ? true : false,
  powerSaving: true,
  PowerOnInterval: 15,
}, require('Storage').readJSON("terminalclock.json", true) || {});

// turn the services before drawing anything
turnOnServices();
if(settings.powerSaving){
  setInterval(turnOnServices, settings.PowerOnInterval*60000); // every PowerOnInterval min
}
// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load and draw widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
// draw immediately at first
draw();
setInterval(draw, 10000); // every 10 seconds
