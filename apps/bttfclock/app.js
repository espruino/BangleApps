require("Font8x16").add(Graphics);
require("Font7x11Numeric7Seg").add(Graphics);
require("Font5x7Numeric7Seg").add(Graphics);
require("Font4x5").add(Graphics);

const timeTextY = 4;
const timeDataY = timeTextY+19;
const DateTextY = 48;
const DateDataY = DateTextY+19;
const stepGoalBatTextY = 100;
const stepGoalBatdataY = stepGoalBatTextY+19;
const statusTextY = 140;
const statusDataY = statusTextY+19;
let stepGoal = (require("Storage").readJSON("health.json",1)||10000).stepGoal;
let steps = 0;
let alarmStatus = (require('Storage').readJSON('sched.json',1)||[]).some(alarm=>alarm.on);


const bluetoothOnIcon = require("heatshrink").decompress(atob("iEQwYROg3AAokYAgUMg0DAoUBwwFDgE2CIYdHAogREDoopFGoodGABI="));

const bluetoothOffIcon = require("heatshrink").decompress(atob("iEQwYLIgwFF4ADBgYFBjAKCsEGBAIABhgFEgOA7AdDmApKmwpCC4OGFIYjFGoVgIIkMEZAAD"));

const alarmIcon = require("heatshrink").decompress(atob("iEQyBC/AA3/8ABBB7INHA4YLLDqIHVApJRJCZodNCJ4dPHqqPJGp4RLOaozZT8btLF64hJFJpFbAEYA="));

const notificationIcon = require("heatshrink").decompress(atob("iEQyBC/AB3/8ABBD+4bHEa4VJD6YTNEKIf/D/rTDAJ7jTADo5hK+IA=="));


//the following 2 sections are used from waveclk to schedule minutely updates
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

function getSteps() {
  steps = Bangle.getHealthStatus("day").steps;
}

function drawBackground() {
  //g.setBgColor(1,1,1);
  g.setBgColor('#555555');
  g.setColor(1,1,1);
  g.clear();
  //g.drawImage(imgBg,0,0);
  g.reset();
}
function drawBlackBox() {
  g.reset();
  g.setBgColor(1,0,0);
  g.setColor(0,0,0);

  //Hour, Min and Sec
  g.fillRect(50, timeDataY,50+33,timeDataY+22);
  g.fillRect(90, timeDataY,90+33, timeDataY+22);
  g.fillRect(128, timeDataY+8,130+24, timeDataY+8+14);
  //Day, Month, Day and Year
  g.fillRect(9, DateDataY,9+24, DateDataY+15);
  g.fillRect(42, DateDataY,42+40, DateDataY+15);
  g.fillRect(91, DateDataY,91+24, DateDataY+15);
  g.fillRect(124, DateDataY,124+43, DateDataY+15);
  //Present day
  g.fillRect(60, 86,60+47, 86+7);
  //Middle line
  g.drawLine(0,95,176,95);
  //Step and bat
  g.fillRect(3, stepGoalBatdataY-1, 62, stepGoalBatdataY+15);
  g.fillRect(121, stepGoalBatdataY-1, 150, stepGoalBatdataY+15);

  //Status
  g.fillRect(62, statusDataY-1, 62+49, statusDataY+15);
}
function drawGoal() {
  var goal = stepGoal <= steps;
  g.reset();
  g.setColor(0,0,0);

  g.fillRect(84, stepGoalBatdataY-1, 92, stepGoalBatdataY+15);

  if (goal){
    g.reset();
    g.setColor(0,1,0);
    g.fillRect(84, stepGoalBatdataY, 92, stepGoalBatdataY+7);
  } else {
    g.reset();
    g.setColor(1,0,0);
    g.fillRect(84, stepGoalBatdataY+7, 92, stepGoalBatdataY+14);
  }
}
function drawRedkBox() {
  g.reset();
  g.setBgColor(1,0,0);
  g.setColor(1,0,0);
  //Hour, Min and Sec
  g.fillRect(50, timeTextY,50+33,timeTextY+15);
  g.fillRect(90, timeTextY,90+33, timeTextY+15);
  g.fillRect(128, timeTextY+8,130+24, timeTextY+8+15);
  //Day, Month, Day and Year
  g.fillRect(9, DateTextY,9+24, DateTextY+15);
  g.fillRect(42, DateTextY,42+40, DateTextY+15);
  g.fillRect(91, DateTextY,91+24, DateTextY+15);
  g.fillRect(124, DateTextY,124+43, DateTextY+15);
  //Step, Goal and Bat
  g.fillRect(2, stepGoalBatTextY,2+61, stepGoalBatTextY+15);
  g.fillRect(70, stepGoalBatTextY,72+33, stepGoalBatTextY+15);
  g.fillRect(120, stepGoalBatTextY,120+31, stepGoalBatTextY+15);
  //Status
  g.fillRect(62, statusTextY,62+49, statusTextY+15);
}

function draw(){
  drawBackground();
  getSteps();
  drawBlackBox();
  drawRedkBox();
  drawGoal();
  var date = new Date();
  var h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();
  var d = date.getDate(), y = date.getFullYear();//, w = date.getDay();

  if (h<10) {
    h = ("0"+h).substr(-2);
  }
  if (m<10) {
    m = ("0"+m).substr(-2);
  }
  if (s<10) {
    s = ("0"+s).substr(-2);
  }
  if (d<10) {
    d = ("0"+d).substr(-2);
  }

  g.reset();
  g.setBgColor(1,0,0);
  g.setColor(1,1,1);
  //Draw text
  g.setFont("8x16");
  g.drawString('HOUR', 51, timeTextY+1);
  g.drawString('MIN', 96, timeTextY+1);
  g.drawString('SEC', 130, timeTextY+9);

  g.drawString('DAY', 10, DateTextY+1);
  g.drawString('MONTH', 43, DateTextY+1);
  g.drawString('DAY', 92, DateTextY+1);
  g.drawString(' YEAR ', 125, DateTextY+1);

  g.drawString('STEPS', 15, stepGoalBatTextY+1);
  g.drawString('GOAL', 72, stepGoalBatTextY+1);
  g.drawString(' BAT ', 120, stepGoalBatTextY+1);
  g.drawString('STATUS', 64, statusTextY+1);

  //time
  g.reset();
  g.setBgColor(0,0,0);
  g.setColor(1,0,0);
  g.setFont("5x7Numeric7Seg",2);
  g.drawString(s, 131, timeDataY+8);
  g.setFont("7x11Numeric7Seg",2);
  g.drawString(h, 53, timeDataY);
  g.drawString(m, 93, timeDataY);
  //Date
  g.reset();
  g.setBgColor(0,0,0);
  g.setColor(0,1,0);
  g.setFont("5x7Numeric7Seg",2);
  g.drawString(d, 13, DateDataY);
  g.drawString(y, 127, DateDataY);
  g.setFont("8x16");
  g.drawString(require("locale").month(new Date(), 2).toUpperCase(), 52, DateDataY);
  g.drawString(require("locale").dow(new Date(), 2).toUpperCase(), 92, DateDataY);


  //status
  g.reset();
  g.setBgColor(0,0,0);
  g.setColor(1,1,0);
  g.setFont("5x7Numeric7Seg",2);
  var step = steps;
  var stepl = steps.toString().length;
  var stepdDrawX = 4+(36-(stepl*6))+(4*(6-stepl));
  g.drawString(step, stepdDrawX, stepGoalBatdataY);
  var bat = E.getBattery();
  var batl = bat.toString().length;
  var batDrawX = 122+(18-(batl*6))+(4*(3-batl));
  g.drawString(bat, batDrawX, stepGoalBatdataY);

  //status
  var b = bluetoothOffIcon;
  if (NRF.getSecurityStatus().connected){
    b = bluetoothOnIcon;
  }
  g.drawImage(b, 62, statusDataY-1);
  if (alarmStatus){
    g.drawImage(alarmIcon, 78, statusDataY-1);
  }
  if ((require('Storage').readJSON('messages.json',1)||[]).some(messag=>messag.new==true)){
    g.drawImage(notificationIcon, 94, statusDataY-1);
  }

  g.reset();
  g.setBgColor(0,0,0);
  g.setColor(1,1,1);
  g.setFont("4x5");
  g.drawString('Present day', 62, 88);

  queueDraw();
}

/**
 * This watch is mostly dark, it does not make sense to respect the
 * light theme as you end up with a white strip at the top for the
 * widgets and black watch. So set the colours to the dark theme.
 *
 */
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
//draw();
//the following section is from waveclk
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});


Bangle.setUI("clock");
// Load widgets, but don't show them
Bangle.loadWidgets();
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
g.clear(1);
draw();