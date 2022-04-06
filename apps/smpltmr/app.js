/*
 * SIMPLE TIMER
 *
 * Creator: David Peer
 * Date: 02/2022
 */

Bangle.loadWidgets();


const alarm = require("sched");

const TIMER_IDX = "smpltmr";
const screenWidth = g.getWidth();
const screenHeight = g.getHeight();
const cx = parseInt(screenWidth/2);
const cy = parseInt(screenHeight/2)-12;
var minutes = 5;
var interval; //used for the 1 second interval timer


function isTimerEnabled(){
  var alarmObj = alarm.getAlarm(TIMER_IDX);
  if(alarmObj===undefined || !alarmObj.on){
    return false;
  }

  return true;
}

function getTimerMin(){
  var alarmObj =  alarm.getAlarm(TIMER_IDX);
  return Math.round(alarm.getTimeToAlarm(alarmObj)/(60*1000));
}

function setTimer(minutes){
  alarm.setAlarm(TIMER_IDX, {
    // msg : "Simple Timer",
    timer : minutes*60*1000,
  });
  alarm.reload();
}

function deleteTimer(){
  alarm.setAlarm(TIMER_IDX, undefined);
  alarm.reload();
}

setWatch(_=>load(), BTN1);
function draw(){
  g.clear(1);
  Bangle.drawWidgets();

  if (interval) {
    clearInterval(interval);
  }
  interval = undefined;

  // Write time
  g.setFontAlign(0, 0, 0);
  g.setFont("Vector", 32).setFontAlign(0,-1);

  var started = isTimerEnabled();
  var text = minutes + " min.";
  if(started){
    var min = getTimerMin();
    text = min + " min.";
  }

  var rectWidth = parseInt(g.stringWidth(text) / 2);

  if(started){
    interval = setInterval(draw, 1000);
    g.setColor("#ff0000");
  } else {
    g.setColor(g.theme.fg);
  }
  g.fillRect(cx-rectWidth-5, cy-5, cx+rectWidth, cy+30);

  g.setColor(g.theme.bg);
  g.drawString(text, cx, cy);
}


Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.25);
  var right = g.getWidth() - left;
  var upper = parseInt(g.getHeight() * 0.25);
  var lower = g.getHeight() - upper;

  var isLeft = e.x < left;
  var isRight = e.x > right;
  var isUpper = e.y < upper;
  var isLower = e.y > lower;
  var isMiddle = !isLeft && !isRight && !isUpper && !isLower;
  var started = isTimerEnabled();

  if(isRight && !started){
    minutes += 1;
    Bangle.buzz(40, 0.3);
  } else if(isLeft && !started){
    minutes -= 1;
    Bangle.buzz(40, 0.3);
  } else if(isUpper && !started){
    minutes += 5;
    Bangle.buzz(40, 0.3);
  } else if(isLower && !started){
    minutes -= 5;
    Bangle.buzz(40, 0.3);
  } else if(isMiddle) {
    if(!started){
      setTimer(minutes);
    } else {
      deleteTimer();
    }
    Bangle.buzz(80, 0.6);
  }
  minutes = Math.max(0, minutes);

  draw();
});

g.reset();
draw();