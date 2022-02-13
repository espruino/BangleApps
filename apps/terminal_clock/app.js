var locale = require("locale");
var fontColor = "#00FF00";
var startY = 30;
var paddingY = 2;
var font6x8At4Size = 32;
var font6x8At2Size = 18;
var heartRate = 0;


function setFontSize(pos){
  if(pos == 1)
    g.setFont("6x8", 4);
  else
    g.setFont("6x8", 2);
}

function clearField(pos){
  var yStartPos = startY + 
      paddingY * (pos - 1) + 
      font6x8At4Size * Math.min(1, pos-1) + 
      font6x8At2Size * Math.max(0, pos-2);
    var yEndPos = startY + 
      paddingY * (pos - 1) + 
      font6x8At4Size * Math.min(1, pos) + 
      font6x8At2Size * Math.max(0, pos-1);
    g.clearRect(0, yStartPos, 240, yEndPos);
}

function clearWatchIfNeeded(now){
  if(now.getMinutes() % 10 == 0)
    g.clearRect(0, 0, 240, 240);
}

function drawLine(line, pos){
  setFontSize(pos);
  var yPos = startY + 
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

function drawInput(now, pos){
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

function drawActivity(pos){
  clearField(pos);
  var health = Bangle.getHealthStatus('last');
  var steps_formated = ">Activity: " + parseInt(health.movement/10);
  drawLine(steps_formated, pos);
}


function draw(){
  // console.log("in draw");
  // console.log(settings);
  var curPos = 1;
  g.reset();
  g.setFontAlign(-1, -1);
  g.setColor(fontColor);
  var now = new Date();
  clearWatchIfNeeded(now); // mostly to not have issues when changing days
  drawTime(now, curPos);
  curPos++;
  if(settings.showDate == "Yes"){
    drawDate(now, curPos);
    curPos++;
  }
  if(settings.showHRM == "Yes"){
    drawHRM(curPos);
    curPos++;
  }
  if(settings.showActivity == "Yes"){
    drawActivity(curPos);
    curPos++;
  }
  if(settings.showStepCount == "Yes"){
    drawStepCount(curPos);
    curPos++;
  }
  drawInput(now, curPos);
}


Bangle.on('HRM',function(hrmInfo) {
  if(hrmInfo.confidence >= settings.HRMinConfidence)
    heartRate = hrmInfo.bpm;
});


// Clear the screen once, at startup
g.clear();
// load the settings
var settings = Object.assign({
  // default values
  HRMinConfidence: 40,
  showDate: "Yes",
  showHRM: "Yes",
  showActivity: "Yes",
  showStepCount: "Yes",
}, require('Storage').readJSON("terminal_clock.json", true) || {});
// draw immediately at first
draw();
// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

var secondInterval = setInterval(draw, 10000);
