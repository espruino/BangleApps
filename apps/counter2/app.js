var s = Object.assign({
  display2:true,
  counter0:10,
  counter1:20,
  max0:15,
  max1:25,
  fullscreen:true,
  buzz: true,
  colortext: true,
  keepunlocked: false,
}, require('Storage').readJSON("counter2.json", true) || {});

var sGlob = Object.assign({
  timeout: 10,
}, require('Storage').readJSON("setting.json", true) || {});

const lockTimeout = s.keepunlocked ? 0 : 1000;
if (s.keepunlocked) {
  Bangle.setOptions({lockTimeout});
  Bangle.setLocked(false);
}

const f1 = (s.colortext) ? "#f00" : "#fff";
const f2 = (s.colortext) ? "#00f" : "#fff";
const b1 = (s.colortext) ? g.theme.bg : "#f00";
const b2 = (s.colortext) ? g.theme.bg : "#00f";

var drag;
var dragCurr = {x:0 ,y:0 ,dx:0 ,dy:0 ,b:false};

const screenwidth = g.getWidth();
const screenheight = g.getHeight();
const halfwidth = screenwidth / 2;
const halfheight = screenheight / 2;

const counter = [];
counter[0] = s.counter0;
counter[1] = s.counter1;
const defaults = [];
defaults[0] = s.max0;
defaults[1] = s.max1;

function saveSettings() {
  s.counter0 = counter[0];
  s.counter1 = counter[1];
  s.max0 = defaults[0];
  s.max1 = defaults[1];
  require('Storage').writeJSON("counter2.json", s);
}

let ignoreonce = false;
let fastupdateoccurring = false;
var dragtimeout;

function updateScreen() {
  if (s.display2) {
    g.setBgColor(b1);
    g.clearRect(0, 0, halfwidth, screenheight);
    g.setBgColor(b2);
    g.clearRect(halfwidth, 0, screenwidth, screenheight);
    g.setFont("Vector", 60).setFontAlign(0, 0);
    g.setColor(f1);
    g.drawString(Math.floor(counter[0]), halfwidth * 0.5, halfheight);
    g.setColor(f2);
    g.drawString(Math.floor(counter[1]), halfwidth * 1.5, halfheight);
  }
  else {
    g.setBgColor(b2);  // Using right counter's colors b/c blue looks nicer than red
    g.clearRect(0, 0, screenwidth, screenheight);
    g.setFont("Vector", 90).setFontAlign(0, 0);
    g.setColor(f2);
    g.drawString(Math.floor(counter[0]), halfwidth, halfheight);
  }
  saveSettings();
  if (s.buzz)  Bangle.buzz(50,.5);

  Bangle.loadWidgets();
  if (s.fullscreen) {
    require("widget_utils").hide();
  }
  else {
    Bangle.drawWidgets();
  }
}

// Clearing the timer on lock is likely uneeded, but just in case
Bangle.on('lock', e => {
  drag = undefined;
  var timeOutTimer = sGlob.timeout * 1000;
  Bangle.setOptions({backlightTimeout: timeOutTimer, lockTimeout});
  if (dragtimeout) clearTimeout(dragtimeout);
  fastupdateoccurring = false;
});

Bangle.on("drag", e => {
  const c = (e.x >= halfwidth && s.display2) ? 1 : 0;
  dragCurr = e;
  if (!drag) {
    if (ignoreonce) {
      ignoreonce = false;
      return;
    }
    drag = { x: e.x, y: e.y };
    dragtimeout = setTimeout(function () { fastupdatecounter(c); }, 600); //if dragging for 500ms, reset counter
  }
  else if (drag && !e.b) { // released
    if (!fastupdateoccurring)
      updatecounter(c);
    drag = undefined;
    if (dragtimeout) {
      let timeOutTimer = 1000;
      Bangle.setOptions({backlightTimeout: timeOutTimer, lockTimeout});
      clearTimeout(dragtimeout);
    }
    fastupdateoccurring = false;
  }
});

function updatecounter(which) {
  let adjust = 0;
  const dx = dragCurr.x - drag.x, dy = dragCurr.y - drag.y;
  if (Math.abs(dy) > Math.abs(dx) + 30) {
    adjust = (dy > 0) ? -1 : 1;
  } else {
    adjust = (dragCurr.y > halfheight) ? -1 : 1;
  }
  counter[which] += adjust;
  updateScreen();
}

function fastupdatecounter(which) {
  fastupdateoccurring = true;
  updatecounter(which);
  Bangle.setOptions({backlightTimeout: 0, lockTimeout: 0});
  dragtimeout = setTimeout(function () { fastupdatecounter(which); }, 10);
}


function resetcounter(which) {
  // If which is null, reset all
  fastupdateoccurring = false;
  if (dragtimeout) {
    let timeOutTimer = 1000;
    Bangle.setOptions({backlightTimeout: timeOutTimer, lockTimeout});
    clearTimeout(dragtimeout);
  }
  if (which == null) {
    for (let iter = 0; iter < defaults.length; iter++) {
      counter[iter] = defaults[iter];
    }
    console.log("resetting all counters");
  }
  else {
    counter[which] = defaults[which];
    console.log("resetting counter ", which);
  }
  updateScreen();
  drag = undefined;
  ignoreonce = true;
}

updateScreen();

setWatch(function() {
  for (let which = 0; which < defaults.length; which++) {
    if(counter[which] != defaults[which]) {
      resetcounter(null);
      return;
    }
  }
  var timeOutTimer = sGlob.timeout * 1000;
  Bangle.setOptions({backlightTimeout: timeOutTimer, lockTimeout});
  load();
}, BTN1, {repeat:true, edge:"falling"});
