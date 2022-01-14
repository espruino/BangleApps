var B2 = process.env.HWVERSION==2;
var Layout = require("Layout");
var locale = require("locale")
var fontHeading = "6x8:2";
var fontValue = B2 ? "6x15:2" : "6x8:3";
var headingCol = "#888";
var running = false;
var startTime;
var startSteps;
// This & previous GPS readings
var lastGPS, thisGPS;
var distance = 0; ///< distance in meters
var startSteps = Bangle.getStepCount(); ///< number of steps when we started
var lastStepCount = startSteps; // last time 'step' was called
var stepHistory = new Uint8Array(60); // steps each second for the last minute (0 = current minute)

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

// ---------------------------

function formatTime(ms) {
  var s = Math.round(ms/1000);
  var min = Math.floor(s/60).toString();
  s = (s%60).toString();
  return min.padStart(2,0)+":"+s.padStart(2,0);
}

// Format speed in meters/second
function formatPace(speed) {
  if (speed < 0.1667) {
    return `__'__"`;
  }
  const pace = Math.round(1000 / speed); // seconds for 1km
  const min = Math.floor(pace / 60); // minutes for 1km
  const sec = pace % 60;
  return ('0' + min).substr(-2) + `'` + ('0' + sec).substr(-2) + `"`;
}

// ---------------------------

function clearState() {
  distance = 0;
  startSteps = Bangle.getStepCount();
  stepHistory.fill(0);
  layout.dist.label=locale.distance(distance);
  layout.time.label="00:00";
  layout.pace.label=formatPace(0);
  layout.hrm.label="--";
  layout.steps.label=0;
  layout.cadence.label= "0";
  layout.status.bgCol = "#f00";
}

function onStartStop() {
  running = !running;
  if (running) {
    clearState();
    startTime = Date.now();
  }
  layout.button.label = running ? "STOP" : "START";
  layout.status.label = running ? "RUN" : "STOP";
  layout.status.bgCol = running ? "#0f0" : "#f00";
  // if stopping running, don't clear state
  // so we can at least refer to what we've done
  layout.render();
}

var layout = new Layout( {
  type:"v", c: [
    { type:"h", filly:1, c:[
      {type:"txt", font:fontHeading, label:"DIST", fillx:1, col:headingCol },
      {type:"txt", font:fontHeading, label:"TIME", fillx:1, col:headingCol }
    ]}, { type:"h", filly:1, c:[
      {type:"txt", font:fontValue, label:"0.00", id:"dist", fillx:1 },
      {type:"txt", font:fontValue, label:"00:00", id:"time", fillx:1 }
    ]}, { type:"h", filly:1, c:[
      {type:"txt", font:fontHeading, label:"PACE", fillx:1, col:headingCol },
      {type:"txt", font:fontHeading, label:"HEART", fillx:1, col:headingCol }
    ]}, { type:"h", filly:1, c:[
      {type:"txt", font:fontValue, label:`__'__"`, id:"pace", fillx:1 },
      {type:"txt", font:fontValue, label:"--", id:"hrm", fillx:1 }
    ]}, { type:"h", filly:1, c:[
      {type:"txt", font:fontHeading, label:"STEPS", fillx:1, col:headingCol },
      {type:"txt", font:fontHeading, label:"CADENCE", fillx:1, col:headingCol }
    ]}, { type:"h", filly:1, c:[
      {type:"txt", font:fontValue, label:"0", id:"steps", fillx:1 },
      {type:"txt", font:fontValue, label:"0", id:"cadence", fillx:1 }
    ]}, { type:"h", filly:1, c:[
      {type:"txt", font:fontHeading, label:"GPS", id:"gps", fillx:1, bgCol:"#f00" },
      {type:"txt", font:fontHeading, label:"00:00", id:"clock", fillx:1, bgCol:g.theme.fg, col:g.theme.bg },
      {type:"txt", font:fontHeading, label:"STOP", id:"status", fillx:1 }
    ]},

  ]
},{lazy:true, btns:[{ label:"START", cb: onStartStop, id:"button"}]});
clearState();
layout.render();



function onTimer() {
  layout.clock.label = locale.time(new Date(),1);
  if (!running) {
    layout.render();
    return;
  }
  // called once a second
  var duration = Date.now() - startTime; // in ms
  // set cadence based on steps over last minute
  var stepsInMinute = E.sum(stepHistory);
  var cadence = 60000 * stepsInMinute / Math.min(duration,60000);
  // update layout
  layout.time.label = formatTime(duration);
  layout.steps.label = Bangle.getStepCount()-startSteps;
  layout.cadence.label = Math.round(cadence);
  layout.render();
  // move step history onwards
  stepHistory.set(stepHistory,1);
  stepHistory[0]=0;
}

Bangle.on("GPS", function(fix) {
  layout.gps.bgCol = fix.fix ? "#0f0" : "#f00";
  lastGPS = thisGPS;
  thisGPS = fix;
  if (running && fix.fix && lastGPS.fix) {
    // work out distance - moving from a to b
    var a = Bangle.project(lastGPS);
    var b = Bangle.project(thisGPS);
    var dx = a.x-b.x, dy = a.y-b.y;
    var d = Math.sqrt(dx*dx+dy*dy); // this should be the distance in meters
    distance += d;
    layout.dist.label=locale.distance(distance);
    var duration = Date.now() - startTime; // in ms
    var speed = distance * 1000 / duration; // meters/sec
    layout.pace.label = formatPace(speed);
  }
});
Bangle.on("HRM", function(h) {
  layout.hrm.label = h.bpm;
});
Bangle.on("step", function(steps) {
  if (running) {
    layout.steps.label = steps-Bangle.getStepCount();
    stepHistory[0] += steps-lastStepCount;
  }
  lastStepCount = steps;
});

// We always call ourselves once a second, if only to update the time
setInterval(onTimer, 1000);

/* Turn GPS and HRM on right at the start to ensure
we get the highest chance of a lock. */
Bangle.setHRMPower(true,"app");
Bangle.setGPSPower(true,"app");
