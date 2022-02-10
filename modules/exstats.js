/* Copyright (c) 2022 Bangle.js contibutors. See the file LICENSE for copying permission. */
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

*/
var state = {
  active : false, // are we working or not?
  // startTime, // time exercise started
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
};
// list of active stats (indexed by ID)
var stats = {};

// distance between 2 lat and lons, in meters, Mean Earth Radius = 6371km
// https://www.movable-type.co.uk/scripts/latlong.html
function calcDistance(a,b) {
  function radians(a) { return a*Math.PI/180; }
  var x = radians(a.lon-b.lon) * Math.cos(radians((a.lat+b.lat)/2));
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

  if (!state.active) return;
  state.lastGPS = state.thisGPS;
  state.thisGPS = fix;
  if (state.lastGPS.fix)
    state.distance += calcDistance(state.lastGPS, fix);
  if (stats["dist"]) stats["dist"].emit("changed",stats["dist"]);
  var duration = Date.now() - state.startTime; // in ms
  state.avrSpeed = state.distance * 1000 / duration; // meters/sec
  state.curSpeed = state.curSpeed*0.8 + fix.speed*0.2/3.6; // meters/sec
  if (stats["pacea"]) stats["pacea"].emit("changed",stats["pacea"]);
  if (stats["pacec"]) stats["pacec"].emit("changed",stats["pacec"]);
  if (stats["speed"]) stats["speed"].emit("changed",stats["speed"]);
});

Bangle.on("step", function(steps) {
  if (!state.active) return;
  if (stats["step"]) stats["step"].emit("changed",stats["step"]);
  state.lastStepCount = steps;
});
Bangle.on("HRM", function(h) {
  if (h.confidence>=60) {
    state.BPM = h.bpm;
    state.BPMage = 0;
    stats["bpm"].emit("changed",stats["bpm"]);
  }
});

/** Get list of available statistic types */
exports.getList = function() {
  return [
    {name: "Time", id:"time"},
    {name: "Distance", id:"dist"},
    {name: "Steps", id:"step"},
    {name: "Heart (BPM)", id:"bpm"},
    {name: "Pace (avr)", id:"pacea"},
    {name: "Pace (current)", id:"pacec"},
    {name: "Speed", id:"speed"},
    {name: "Cadence", id:"caden"},
  ];
};
/** Instatiate the given list of statistic IDs (see comments at top)
 options = {
   paceLength : meters to measure pace over
 }
*/
exports.getStats = function(statIDs, options) {
  options = options||{};
  options.paceLength = options.paceLength||1000;
  var needGPS,needHRM;
  // ======================
  if (statIDs.includes("time")) {
    stats["time"]={
      title : "Time",
      getValue : function() { return Date.now()-state.startTime; },
      getString : function() { return formatTime(this.getValue()) },
    };
  };
  if (statIDs.includes("dist")) {
    needGPS = true;
    stats["dist"]={
      title : "Dist",
      getValue : function() { return state.distance; },
      getString : function() { return require("locale").distance(state.distance); },
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
      getString : function() { return require("locale").speed(state.curSpeed*3.6); },
    };
  }
  if (statIDs.includes("caden")) {
    needGPS = true;
    stats["caden"]={
      title : "Cadence",
      getValue : function() { return state.stepsPerMin; },
      getString : function() { return state.stepsPerMin; },
    };
  }
  // ======================
  for (var i in stats) stats[i].id=i; // set up ID field
  if (needGPS) Bangle.setGPSPower(true,"exs");
  if (needHRM) Bangle.setHRMPower(true,"exs");
  setInterval(function() { // run once a second....
    if (!state.active) return;
    // called once a second
    var duration = Date.now() - state.startTime; // in ms
    // set cadence -> steps over last minute
    state.stepsPerMin = Math.round(60000 * E.sum(state.stepHistory) / Math.min(duration,60000));
    if (stats["caden"]) stats["caden"].emit("changed",stats["caden"]);
    // move step history onwards
    state.stepHistory.set(state.stepHistory,1);
    state.stepHistory[0]=0;
    if (stats["time"]) stats["time"].emit("changed",stats["time"]);
    // update BPM - if nothing valid in 60s remove the reading
    state.BPMage++;
    if (state.BPM && state.BPMage>60) {
      state.BPM = 0;
      if (stats["bpm"]) stats["bpm"].emit("changed",stats["bpm"]);
    }
  }, 1000);
  function reset() {
    state.startTime = Date.now();
    state.startSteps = state.lastSteps = Bangle.getStepCount();
    state.lastSteps = 0;
    state.stepHistory.fill(0);
    state.stepsPerMin = 0;
    state.distance = 0;
    state.avrSpeed = 0;
    state.curSpeed = 0;
    state.BPM = 0;
    state.BPMage = 0;
  }
  reset();
  return {
    stats : stats, state : state,
    start : function() {
      state.active = true;
      reset();
    },
    stop : function() {
      state.active = false;
    }
  };
};

exports.appendMenuItems = function(menu, settings, saveSettings) {
  var paceNames = ["1000m","1 mile","1/2 Mthn", "Marathon",];
  var paceAmts = [1000,1609,21098,42195];
  menu['Pace'] = {
    min :0, max: paceNames.length-1,
    value: Math.max(paceAmts.indexOf(settings.paceLength),0),
    format: v => paceNames[v],
    onchange: v => {
      settings.paceLength = paceAmts[v];
      saveSettings();
    },
  };
};
