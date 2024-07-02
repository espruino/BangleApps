Bangle.loadWidgets();
g.clear(true);
Bangle.drawWidgets();

Bangle.setLCDTimeout(undefined);

let renderIntervalId;
let startTime;

const locale = require("locale");

const DEFAULTS = {
  units: 0,
};

const settings = require("Storage").readJSON("thunder.json", 1) || DEFAULTS;

var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"6x8:2", label:"", id:"time", fillx:1},
    {type:"txt", pad:8, font:"20%", label:"", id:"distance", fillx:1},
    {type:"h", c: [
      {type:"btn", font:"6x8:2", label:"Flash", cb: l=>flash() },
      {type:"img", pad:4, src:atob("DhoBH+B/gf4P8D/A/gP4H+B/AfwH8B//////7/+A/APwD4A+APADwA4AcAHABgAYAA==") },
      {type:"btn", font:"6x8:2", label:"Boom", cb: l=>boom() }
    ]},
  ]
}, {
  lazy: true,
  back: load,
});

// TODO The code in this function appears in various apps so it might be
// nice to add something to the time_utils module. (There is already a
// formatDuration function but that doesn't quite work the same way.)
const getTime = function(milliseconds) {
  let hrs = Math.floor(milliseconds/3600000);
  let mins = Math.floor(milliseconds/60000)%60;
  let secs = Math.floor(milliseconds/1000)%60;
  let tnth = Math.floor(milliseconds/100)%10;
  let text;

  if (hrs === 0) {
    text = ("0"+mins).slice(-2) + ":" + ("0"+secs).slice(-2) + "." + tnth;
  } else {
    text = ("0"+hrs) + ":" + ("0"+mins).slice(-2) + ":" + ("0"+secs).slice(-2);
  }

  return text;
};

// Convert milliseconds to distance based on one km in 2.91 s or
// one mile in 4.69 s
// See https://en.wikipedia.org/wiki/Speed_of_sound
const getDistance = function(milliseconds) {
  let secs = milliseconds/1000;
  let distance;

  if (settings.units === 1) {
    let kms = Math.round((secs / 2.91) * 10) / 10;
    distance = kms.toFixed(1) + "km";
  } else if (settings.units === 2) {
    let miles = Math.round((secs / 4.69) * 10) / 10;
    distance = miles.toFixed(1) + "mi";
  } else {
    let meters = (secs / 2.91) * 1000;
    distance = locale.distance(meters);
  }

  return distance;
};

const renderIntervalCallback = function() {
  if (startTime === undefined) {
    return;
  }

  updateTimeAndDistance();
};

const flashAndBoom = function() {
  Bangle.buzz(50, 0.5);

  if (renderIntervalId !== undefined) {
    clearInterval(renderIntervalId);
    renderIntervalId = undefined;
  }
};

const flash = function() {
  flashAndBoom();
  
  startTime = undefined;
  updateTimeAndDistance();

  startTime = Date.now();
  renderIntervalId = setInterval(renderIntervalCallback, 100);
};

const boom = function() {
  flashAndBoom();
  
  updateTimeAndDistance();
  startTime = undefined;
};

const updateTimeAndDistance = function() {
  let t;

  if (startTime === undefined) {
    t = 0;
  } else {
    t = Date.now() - startTime;
  }

  layout.time.label = getTime(t);
  layout.distance.label = getDistance(t);

  layout.render();
  // layout.debug();
};

updateTimeAndDistance();
