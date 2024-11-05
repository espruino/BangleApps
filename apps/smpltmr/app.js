/*
 * SIMPLE TIMER
 *
 * Creator: David Peer
 * Date: 02/2022
 * 
 * Modified: Sir Indy
 * Date: 05/2022
 */

const Layout = require("Layout");
const alarm = require("sched")
const TIMER_IDX = "smpltmr";

const secondsToTime = (s) => new Object({h:Math.floor((s/3600) % 24), m:Math.floor((s/60) % 60), s:Math.floor(s % 60)});
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
function formatTime(s) {
  var t = secondsToTime(s);
  if (t.h) {
    return t.h + ':' + ("0" + t.m).substr(-2) + ':' + ("0" + t.s).substr(-2);
  } else {
    return t.m + ':' + ("0" + t.s).substr(-2);
  }
}

var seconds = 5 * 60; // Default to 5 minutes
var drawTimeout;
//var timerRunning = false;
function timerRunning() {
  return (alarm.getTimeToAlarm(alarm.getAlarm(TIMER_IDX)) != undefined)
}
const imgArrow = atob("CQmBAAgOBwfD47ndx+OA");
const imgPause = atob("GBiBAP+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B/w==");
const imgPlay = atob("GBiBAIAAAOAAAPgAAP4AAP+AAP/gAP/4AP/+AP//gP//4P//+P///v///v//+P//4P//gP/+AP/4AP/gAP+AAP4AAPgAAOAAAIAAAA==");

function onDrag(event) {
  if (!timerRunning()) {
    Bangle.buzz(40, 0.3);
    var diff = -Math.round(event.dy/5);
    if (event.x < timePickerLayout.hours.w) {
      diff *= 3600;
    } else if (event.x > timePickerLayout.mins.x && event.x < timePickerLayout.secs.x) {
      diff *= 60;
    }
    updateTimePicker(diff);
  }
}

function onTouch(button, xy) {
  if (xy.y > (timePickerLayout.btnStart.y||timerLayout.btnStart.y)) {
    Bangle.buzz(40, 0.3);
    onButton();
    return;
  }
  if (!timerRunning()) {
    var touchMidpoint = timePickerLayout.hours.y + timePickerLayout.hours.h/2;
    var diff = 0;
    Bangle.buzz(40, 0.3);
    if (xy.y > 24 && xy.y < touchMidpoint - 10) {
      diff = 1;
    } else if (xy.y > touchMidpoint + 10 && xy.y < timePickerLayout.btnStart.y) {
      diff = -1;
    }
    if (xy.x < timePickerLayout.hours.w) {
      diff *= 3600;
    } else if (xy.x > timePickerLayout.mins.x && xy.x < timePickerLayout.secs.x) {
      diff *= 60;
    }
    updateTimePicker(diff);
  }
  
}

function onButton() {
  g.clearRect(Bangle.appRect);
  if (timerRunning()) {
    timerStop();
  } else {
    if (seconds > 0) {
      timerRun();
    }
  }
}

function updateTimePicker(diff) {
  seconds = clamp(seconds + (diff || 0), 0, 24 * 3600 - 1);
  var set_time = secondsToTime(seconds);
  updateLayoutField(timePickerLayout, 'hours', set_time.h);
  updateLayoutField(timePickerLayout, 'mins', set_time.m); 
  updateLayoutField(timePickerLayout, 'secs', set_time.s); 
}

function updateTimer() {
  var timeToNext = alarm.getTimeToAlarm(alarm.getAlarm(TIMER_IDX));
  updateLayoutField(timerLayout, 'timer', formatTime(timeToNext / 1000)); 
  queueDraw(1000);
}

function queueDraw(millisecs) {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    updateTimer();
  }, millisecs - (Date.now() % millisecs));
}

function timerRun() {
  alarm.setAlarm(TIMER_IDX, {
    vibrate : ".-.-",
    hidden: true,
    timer : seconds * 1000
  });
  alarm.reload();
  g.clearRect(Bangle.appRect);
  timerLayout.render();
  updateTimer();
}

function timerStop() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  var timeToNext = alarm.getTimeToAlarm(alarm.getAlarm(TIMER_IDX));
  if (timeToNext != undefined) {
    seconds = timeToNext / 1000;
  }
  alarm.setAlarm(TIMER_IDX, undefined);
  alarm.reload();
  g.clearRect(Bangle.appRect);
  timePickerLayout.render();
  updateTimePicker();
}

var timePickerLayout = new Layout({
  type:"v", c: [
    {type:undefined, height:2},
    {type:"h", c: [
      {type:"v", width:g.getWidth()/3, c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Hours"},
        {type:"img", pad:8, src:imgArrow},
        {type:"txt", font:"20%", label:"00", id:"hours", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrow, r:2}
      ]},
      {type:"v", width:g.getWidth()/3, c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Minutes"},
        {type:"img", pad:8, src:imgArrow},
        {type:"txt", font:"20%", label:"00", id:"mins", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrow, r:2}
      ]},
      {type:"v", width:g.getWidth()/3, c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Seconds"},
        {type:"img", pad:8, src:imgArrow},
        {type:"txt", font:"20%", label:"00", id:"secs", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrow, r:2}
      ]},
    ]},
    {type:"btn", src:imgPlay, id:"btnStart", fillx:1 }
  ], filly:1
});

var timerLayout = new Layout({
  type:"v", c: [
    {type:"txt", font:"22%", label:"0:00", id:"timer", fillx:1, filly:1 },
    {type:"btn", src:imgPause, id:"btnStart", cb: l=>timerStop(), fillx:1 }
  ], filly:1
});

function updateLayoutField(layout, field, value) {
  layout.clear(layout[field]);
  layout[field].label = value;
  layout.render(layout[field]);
}

Bangle.loadWidgets();
Bangle.drawWidgets();

let uiOptions = {
  mode : "custom",
  touch : function(n,e) {onTouch(n,e);},
  drag : function(e) {onDrag(e);},
};
if (parseFloat(process.env.VERSION.replace("v","")) < 224.164) {uiOptions.btn = function(n) {onButton();};}
else {uiOptions.btnRelease = function(n) {onButton();};}

Bangle.setUI(uiOptions);

g.clearRect(Bangle.appRect);
if (timerRunning()) {
  timerLayout.render();
  updateTimer();
} else {
  timePickerLayout.render();
  updateTimePicker();
}
