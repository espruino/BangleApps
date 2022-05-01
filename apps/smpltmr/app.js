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
const timerID = "simpletimer";

Bangle.loadWidgets();
Bangle.drawWidgets();

var Layout = require("Layout");
var seconds = 5 * 60; // Default to 5 minutes
var drawTimeout;
var timerRunning = false;
var imgArrow = Graphics.createImage(`
    x
   xxx
   xxx
  xxxxx
  xxxxx
 xxx xxx 
 xxx xxx 
xxx   xxx
xxx   xxx
`);

const imgPause = atob("GBiBAP+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B//+B/w==");
const imgPlay = atob("GBiBAIAAAOAAAPgAAP4AAP+AAP/gAP/4AP/+AP//gP//4P//+P///v///v//+P//4P//gP/+AP/4AP/gAP+AAP4AAPgAAOAAAIAAAA==");

function onDrag(event) {
  Bangle.buzz(40, 0.3);
  var diff = -Math.round(event.dy/5);
  if (event.x < timePickerLayout.hours.w) {
    diff *= 3600;
  } else if (event.x > timePickerLayout.mins.x && event.x < timePickerLayout.secs.x) {
    diff *= 60;
  }
  updateTimePicker(diff);
}

function onTouch(button, xy) {
  var touchMidpoint = timePickerLayout.hours.y + timePickerLayout.hours.h/2;
  var diff = 0;
  if (xy.y > 24 && xy.y < touchMidpoint - 10) {
    Bangle.buzz(40, 0.3);
    diff = 1;
  } else if (xy.y > touchMidpoint + 10 && xy.y < timePickerLayout.btnStart.y) {
    Bangle.buzz(40, 0.3);
    diff = -1;
  } else if (xy.y > timePickerLayout.btnStart.y) {
    Bangle.buzz(40, 0.6);
    onButton();
    return;
  }
  if (xy.x < timePickerLayout.hours.w) {
    diff *= 3600;
  } else if (xy.x > timePickerLayout.mins.x && xy.x < timePickerLayout.secs.x) {
    diff *= 60;
  }
  updateTimePicker(diff);
}

function onButton() {
  g.clearRect(Bangle.appRect);
  if (timerRunning) {
    timerRunning = false;
    timerStop();
  } else {
    timerRunning = true;
    timerRun();
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
  var timeToNext = require("sched").getTimeToAlarm(require("sched").getAlarm(timerID));
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

function runTimePicker() {
  g.clearRect(Bangle.appRect);
  Bangle.setUI({
    mode : "custom",
    touch : function(n,e) {onTouch(n,e);},
    drag : function(e) {onDrag(e);},
    btn : function(n) {onButton();},
  });
  timePickerLayout.render();
  updateTimePicker();
  //timePickerLayout.debug();
}

function timerRun() {
  require("sched").setAlarm(timerID, {
    vibrate : ".-.-",
    hidden: true,
    timer : seconds * 1000
  });
  require("sched").reload();
  g.clearRect(Bangle.appRect);
  timerLayout.render();
  updateTimer();
}

function timerStop() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  var timeToNext = require("sched").getTimeToAlarm(require("sched").getAlarm(timerID));
  if (timeToNext != undefined) {
    seconds = timeToNext / 1000;
  }
  require("sched").setAlarm(timerID, undefined);
  require("sched").reload();
  runTimePicker(); 
}

var timePickerLayout = new Layout({
  type:"v", c: [
    {type:undefined, height:2},
    {type:"h", c: [
      {type:"v", width:g.getWidth()/3, c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Hours", col:g.theme.fg2},
        {type:"img", pad:8, src:imgArrow, col:g.theme.fg2},
        {type:"txt", font:"20%", label:"00", id:"hours", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrow, col:g.theme.fg2, r:2}
      ]},
      {type:"v", width:g.getWidth()/3, c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Minutes", col:g.theme.fg2},
        {type:"img", pad:8, src:imgArrow, col:g.theme.fg2},
        {type:"txt", font:"20%", label:"00", id:"mins", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrow, col:g.theme.fg2, r:2}
      ]},
      {type:"v", width:g.getWidth()/3, c: [
        {type:"txt", font:"6x8", label:/*LANG*/"Seconds", col:g.theme.fg2},
        {type:"img", pad:8, src:imgArrow, col:g.theme.fg2},
        {type:"txt", font:"20%", label:"00", id:"secs", filly:1, fillx:1},
        {type:"img", pad:8, src:imgArrow, col:g.theme.fg2, r:2}
      ]},
    ]},
    {type:"btn", src:imgPlay, id:"btnStart", fillx:1 }
  ], filly:1
});

var timerLayout = new Layout({
  type:"v", c: [
    {type:"txt", font:"22%", label:"0:00", id:"timer", fillx:1, filly:1 },
    {type:"btn", src:imgPause, cb: l=>timerStop(), fillx:1 }
  ], filly:1
});

function updateLayoutField(layout, field, value) {
  layout.clear(layout[field]);
  layout[field].label = value;
  layout.render(layout[field]);
}

if (require("sched").getTimeToAlarm(require("sched").getAlarm(timerID)) != undefined) {
  timerRunning = true;
}
onButton();