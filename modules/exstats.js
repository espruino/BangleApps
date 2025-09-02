/* Copyright (c) 2022 Bangle.js contributors. See the file LICENSE for copying permission. */
/*  Exercise Stats module

Take a look at README.md for hints on developing with this library.

Usage
-----

var ExStats = require("exstats");
// Get a list of available types of run statistic
print(ExStats.getList());
// returns list of available stat IDs like
[
  {name: "Time", id:"time"},
  {name: "Distance", id:"dist"},
  {name: "Steps", id:"step"},
  {name: "Heart (BPM)", id:"bpm"},
  {name: "Max BPM", id:"maxbpm"},
  {name: "Pace (avr)", id:"pacea"},
  {name: "Pace (current)", id:"pacec"},
  {name: "Cadence", id:"caden"},
]

// Setup and load all statistic types
var exs = ExStats.getStats(["dist", "time", "pacea","bpm","step","caden"], options);
// exs contains
{
  stats : { time : {
              id : "time"
              title : "Time" // title to use when rendering
              getValue : function // get a floating point value for this stat
              getString : function // get a formatted string for this stat
              // also fires a 'changed' event
            },
            dist : { ... },
            pacea : { ... },
            ...
          },
  state : { active : bool,
            .. other internal-ish state info
          },
  start : function, // call to start exercise and reset state
  stop : function, // call to stop exercise
}

/// Or you can display a menu where the settings can be configured - these are passed as the 'options' argument of getStats

var menu = { ... };
ExStats.appendMenuItems(menu, settings, saveSettingsFunction);
E.showMenu(menu);

'options' can also include:

 options = {
   paceLength : meters to measure pace over
   notify: {
    dist: {
      increment: 0 to not notify on distance milestones, otherwise the number of meters to notify after, repeating
    },
    step: {
      increment: 0 to not notify on step milestones, otherwise the number of steps to notify after, repeating
    },
    time: {
      increment: 0 to not notify on time milestones, otherwise the number of milliseconds to notify after, repeating
    }
   }
 }


// Additionally, if your app makes use of the stat notifications, you can display additional menu
// settings for configuring when to notify (note the added line in the example below)

var menu = { ... };
ExStats.appendMenuItems(menu, settings, saveSettingsFunction);
ExStats.appendNotifyMenuItems(menu, settings, saveSettingsFunction);
E.showMenu(menu);


*/
var state = {
  active : false, // are we working or not?
  // startTime, // time exercise started (in ms from 1970)
  // lastTime, // time we had our last reading (in ms from 1970)
  duration : 0, // the length of this exercise (in ms)
  lastGPS:{}, thisGPS:{}, // This & previous GPS readings
  // distance : 0, ///< distance in meters
  // avrSpeed : 0, ///< speed over whole run in m/sec
  // curSpeed : 0, ///< current (but averaged speed) in m/sec
  startSteps : Bangle.getStepCount(), ///< number of steps when we started
  lastSteps : Bangle.getStepCount(), // last time 'step' was called
  stepHistory : new Uint8Array(60), // steps each second for the last minute (0 = current minute)
  // stepsInMinute // steps over the last minute
  // cadence // steps per minute adjusted if <1 minute
  // BPM // beats per minute
  // BPMage // how many seconds was BPM set?
  // maxBPM // The highest BPM reached while active
  // notify: { }, // Notifies: 0 for disabled, otherwise how often to notify in meters, seconds, or steps
};
// list of active stats (indexed by ID)
var stats = {};

const DATA_FILE = "exstats.json";
// Load the state from a saved file if there was one
state = Object.assign(state, require("Storage").readJSON(DATA_FILE,1)||{});
state.startSteps = Bangle.getStepCount()  - (state.lastSteps - state.startSteps);
// force step history to a uint8array
state.stepHistory = new Uint8Array(state.stepHistory);
// when we exit, write the current state
E.on('kill', function() {
  require("Storage").writeJSON(DATA_FILE, state);
});

// distance between 2 lat and lons, in meters, Mean Earth Radius = 6371km
// https://www.movable-type.co.uk/scripts/latlong.html
// (Equirectangular approximation)
function calcDistance(a,b) {
  function radians(a) { return a*Math.PI/180; }
  var x = radians(b.lon-a.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  return Math.sqrt(x*x + y*y) * 6371000;
}

// Given milliseconds, return a time
function formatTime(ms) {
  let hrs = Math.floor(ms/3600000).toString();
  let mins = (Math.floor(ms/60000)%60).toString();
  let secs = (Math.floor(ms/1000)%60).toString();

  if (hrs === '0')
    return mins.padStart(2,0)+":"+secs.padStart(2,0);
  else
    return hrs+":"+mins.padStart(2,0)+":"+secs.padStart(2,0); // dont pad hours
}

// Format speed in meters/second, paceLength=length in m for pace over
function formatPace(speed, paceLength) {
  if (speed < 0.1667) {
    return `__:__`;
  }
  const pace = Math.round(paceLength / speed); // seconds for paceLength (1000=1km)
  const min = Math.floor(pace / 60); // minutes for paceLength
  const sec = pace % 60;
  return ('0' + min).substr(-2) + `:` + ('0' + sec).substr(-2);
}

Bangle.on("GPS", function(fix) {
  if (!fix.fix) return; // only process actual fixes
  state.lastGPS = state.thisGPS;
  state.thisGPS = fix;
  if (stats["altg"]) stats["altg"].emit("changed",stats["altg"]);
  if (stats["speed"]) stats["speed"].emit("changed",stats["speed"]);
  if (!state.active) return;
  if (state.lastGPS.fix)
    state.distance += calcDistance(state.lastGPS, fix);
  if (stats["dist"]) stats["dist"].emit("changed",stats["dist"]);
  state.avrSpeed = state.distance * 1000 / state.duration; // meters/sec
  if (!isNaN(fix.speed)) state.curSpeed = state.curSpeed*0.8 + fix.speed*0.2/3.6; // meters/sec
  if (stats["pacea"]) stats["pacea"].emit("changed",stats["pacea"]);
  if (stats["pacec"]) stats["pacec"].emit("changed",stats["pacec"]);
  if (state.notify.dist.increment > 0 && state.notify.dist.next <= state.distance) {
    state.notify.dist.next = state.notify.dist.next + state.notify.dist.increment;
    stats["dist"].emit("notify",stats["dist"]);
  }
});

Bangle.on("step", function(steps) {
  if (!state.active) return;
  if (stats["step"]) stats["step"].emit("changed",stats["step"]);
  state.stepHistory[0] += steps-state.lastSteps;
  state.lastSteps = steps;
  if (state.notify.step.increment > 0 && state.notify.step.next <= steps) {
    state.notify.step.next = state.notify.step.next + state.notify.step.increment;
    stats["step"].emit("notify",stats["step"]);
  }
});
Bangle.on("HRM", function(h) {
  if (h.confidence>=60) {
    state.BPM = h.bpm;
    state.BPMage = 0;
    if (state.maxBPM < h.bpm) {
      state.maxBPM = h.bpm;
      if (stats["maxbpm"]) stats["maxbpm"].emit("changed",stats["maxbpm"]);
    }
    if (stats["bpm"]) stats["bpm"].emit("changed",stats["bpm"]);
  }
});
if (Bangle.setBarometerPower) Bangle.on("pressure", function(e) {
  if (state.alt === undefined)
    state.alt = e.altitude;
  else
    state.alt = state.alt*0.9 + e.altitude*0.1;
  var i = Math.round(state.alt);
  if (i!==state.alti) {
    state.alti = i;
    if (stats["altb"]) stats["altb"].emit("changed",stats["altb"]);
  }
});

/** Get list of available statistic types */
exports.getList = function() {
  var l = [
    {name: "Time", id:"time"},
    {name: "Distance", id:"dist"},
    {name: "Steps", id:"step"},
    {name: "Heart (BPM)", id:"bpm"},
    {name: "Max BPM", id:"maxbpm"},
    {name: "Pace (avg)", id:"pacea"},
    {name: "Pace (curr)", id:"pacec"},
    {name: "Speed", id:"speed"},
    {name: "Cadence", id:"caden"},
    {name: "Altitude (GPS)", id:"altg"}
  ];
  if (Bangle.setBarometerPower) l.push({name: "Altitude (baro)", id:"altb"});
  return l;
};
/** Instantiate the given list of statistic IDs (see comments at top)
*/
exports.getStats = function(statIDs, options) {
  options = options||{};
  options.paceLength = options.paceLength||1000;
  if (!options.notify) options.notify = {};
  ["dist","step","time"].forEach(stat => {
    if (!options.notify[stat]) options.notify[stat] = {};
    options.notify[stat].increment = options.notify[stat].increment||0;
  });
  state.notify = options.notify;
  var needGPS,needHRM,needBaro;
  // ======================
  if (statIDs.includes("time")) {
    stats["time"]={
      title : "Time",
      getValue : function() { return state.duration; },
      getString : function() { return formatTime(this.getValue()) },
    };
  }
  if (statIDs.includes("dist")) {
    needGPS = true;
    stats["dist"]={
      title : "Dist",
      getValue : function() { return state.distance; },
      getString : function() { return require("locale").distance(state.distance,2); },
    };
  }
  if (statIDs.includes("step")) {
    stats["step"]={
      title : "Steps",
      getValue : function() { return Bangle.getStepCount() - state.startSteps; },
      getString : function() { return this.getValue().toString() },
    };
  }
  if (statIDs.includes("bpm")) {
    needHRM = true;
    stats["bpm"]={
      title : "BPM",
      getValue : function() { return state.BPM; },
      getString : function() { return state.BPM||"--" },
    };
  }
  if (statIDs.includes("maxbpm")) {
    needHRM = true;
    stats["maxbpm"]={
      title : "Max BPM",
      getValue : function() { return state.maxBPM; },
      getString : function() { return state.maxBPM||"--" },
    };
  }
  if (statIDs.includes("pacea")) {
    needGPS = true;
    stats["pacea"]={
      title : "A Pace",
      getValue : function() { return state.avrSpeed; }, // in m/sec
      getString : function() { return formatPace(state.avrSpeed, options.paceLength); },
    };
  }
  if (statIDs.includes("pacec")) {
    needGPS = true;
    stats["pacec"]={
      title : "C Pace",
      getValue : function() { return state.curSpeed; }, // in m/sec
      getString : function() { return formatPace(state.curSpeed, options.paceLength); },
    };
  }
  if (statIDs.includes("speed")) {
    needGPS = true;
    stats["speed"]={
      title : "Speed",
      getValue : function() { return state.curSpeed*3.6; }, // in kph
      getString : function() { return require("locale").speed(state.curSpeed*3.6,2); },
    };
  }
  if (statIDs.includes("caden")) {
    stats["caden"]={
      title : "Cadence",
      getValue : function() { return state.stepsPerMin; },
      getString : function() { return state.stepsPerMin; },
    };
  }
  if (statIDs.includes("altg")) {
    needGPS = true;
    stats["altg"]={
      title : "Altitude",
      getValue : function() { return state.thisGPS.alt; },
      getString : function() { return (state.thisGPS.alt===undefined)?"-":Math.round(state.thisGPS.alt)+"m"; },
    };
  }
  if (statIDs.includes("altb")) {
    needBaro = true;
    stats["altb"]={
      title : "Altitude",
      getValue : function() { return state.alt; },
      getString : function() { return (state.alt===undefined)?"-":state.alti+"m"; },
    };
  }
  // ======================
  for (var i in stats) stats[i].id=i; // set up ID field
  if (needGPS) Bangle.setGPSPower(true,"exs");
  if (needHRM) Bangle.setHRMPower(true,"exs");
  if (needBaro) Bangle.setBarometerPower(true,"exs");
  setInterval(function() { // run once a second....
    if (!state.active) return;
    // called once a second
    var now = Date.now();
    state.duration += now - state.lastTime; // in ms
    state.lastTime = now;
    if (stats["time"]) stats["time"].emit("changed",stats["time"]);
    // set cadence -> steps over last minute
    state.stepsPerMin = Math.round(60000 * E.sum(state.stepHistory) / Math.min(state.duration,60000));
    if (stats["caden"]) stats["caden"].emit("changed",stats["caden"]);
    // move step history onwards
    state.stepHistory.set(state.stepHistory,1);
    state.stepHistory[0]=0;
    // update BPM - if nothing valid in 60s remove the reading
    state.BPMage++;
    if (state.BPM && state.BPMage>60) {
      state.BPM = 0;
      if (stats["bpm"]) stats["bpm"].emit("changed",stats["bpm"]);
    }
    if (state.notify.time.increment > 0 && state.notify.time.next <= state.duration) {
      state.notify.time.next = state.notify.time.next + state.notify.time.increment;
      stats["time"].emit("notify",stats["time"]);
    }
  }, 1000);
  function reset() {
    state.startTime = state.lastTime = Date.now();
    state.duration = 0;
    state.startSteps = state.lastSteps = Bangle.getStepCount();
    state.stepHistory.fill(0);
    state.stepsPerMin = 0;
    state.distance = 0;
    state.avrSpeed = 0;
    state.curSpeed = 0;
    state.BPM = 0;
    state.BPMage = 0;
    state.maxBPM = 0;
    state.alt = undefined; // barometer altitude (meters)
    state.alti = 0; // integer ver of state.alt (to avoid repeated 'changed' notifications)
    state.notify = options.notify;
    if (state.notify.dist.increment > 0)
      state.notify.dist.next = state.distance + state.notify.dist.increment;
    if (state.notify.step.increment > 0)
      state.notify.step.next = state.startSteps + state.notify.step.increment;
    if (state.notify.time.increment > 0)
      state.notify.time.next = state.startTime + state.notify.time.increment;
  }
  if (!state.active) reset(); // we might already be active
  return {
    stats : stats,
    state : state,
    start : function() {
      reset();
      state.active = true;
    },
    stop : function() {
      state.active = false;
    },
    resume : function() {
      state.lastTime = Date.now();
      state.lastSteps = Bangle.getStepCount()
      state.active = true;
    },
  };
};

exports.appendMenuItems = function(menu, settings, saveSettings) {
  var paceNames = ["1000m", "1 mile", "1/2 Mthn", "Marathon",];
  var paceAmts = [1000, 1609, 21098, 42195];
  menu['Pace'] = {
    min: 0, max: paceNames.length - 1,
    value: Math.max(paceAmts.indexOf(settings.paceLength), 0),
    format: v => paceNames[v],
    onchange: v => {
      settings.paceLength = paceAmts[v];
      saveSettings();
    },
  };
}
exports.appendNotifyMenuItems = function(menu, settings, saveSettings) {
  var distNames = ['Off', "1000m","1 mile","1/2 Mthn", "Marathon",];
  var distAmts = [0, 1000, 1609, 21098, 42195];
  menu['Ntfy Dist'] = {
    min: 0, max: distNames.length-1,
    value: Math.max(distAmts.indexOf(settings.notify.dist.increment),0),
    format: v => distNames[v],
    onchange: v => {
      settings.notify.dist.increment = distAmts[v];
      saveSettings();
    },
  };
  var stepNames = ['Off', '100', '500', '1000', '5000', '10000'];
  var stepAmts = [0, 100, 500, 1000, 5000, 10000];
  menu['Ntfy Steps'] = {
    min: 0, max: stepNames.length-1,
    value: Math.max(stepAmts.indexOf(settings.notify.step.increment),0),
    format: v => stepNames[v],
    onchange: v => {
      settings.notify.step.increment = stepAmts[v];
      saveSettings();
    },
  };
  var timeNames = ['Off', '30s', '1min', '2min', '5min', '10min', '30min', '1hr'];
  var timeAmts = [0, 30000, 60000, 120000, 300000, 600000, 1800000, 3600000];
  menu['Ntfy Time'] = {
    min: 0, max: timeNames.length-1,
    value: Math.max(timeAmts.indexOf(settings.notify.time.increment),0),
    format: v => timeNames[v],
    onchange: v => {
      settings.notify.time.increment = timeAmts[v];
      saveSettings();
    },
  };
};
