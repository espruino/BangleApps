// Use widget utils to show/hide widgets
let wu = require("widget_utils");

let runInterval;
let karvonnenActive = false;
// Run interface wrapped in a function
let ExStats = require("exstats");
let B2 = process.env.HWVERSION===2;
let Layout = require("Layout");
let locale = require("locale");
let fontHeading = "6x8:2";
let fontValue = B2 ? "6x15:2" : "6x8:3";
let headingCol = "#888";
let fixCount = 0;
let isMenuDisplayed = false;

g.reset().clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
wu.show();

// ---------------------------
let settings = Object.assign({
  record: true,
  B1: "dist",
  B2: "time",
  B3: "pacea",
  B4: "bpm",
  B5: "step",
  B6: "caden",
  paceLength: 1000,
  notify: {
    dist: {
      value: 0,
      notifications: [],
    },
    step: {
      value: 0,
      notifications: [],
    },
    time: {
      value: 0,
      notifications: [],
    },
    HRM: {
      min: 65,
      max: 170,
    }
  },
}, require("Storage").readJSON("run.json", 1) || {});
let statIDs = [settings.B1,settings.B2,settings.B3,settings.B4,settings.B5,settings.B6].filter(s=>s!=="");
let exs = ExStats.getStats(statIDs, settings);
// ---------------------------

// Called to start/stop running
function onStartStop() {
  let running = !exs.state.active;
  let prepPromises = [];

  // start/stop recording
  // Do this first in case recorder needs to prompt for
  // an overwrite before we start tracking exstats
  if (settings.record && WIDGETS["recorder"]) {
    if (running) {
      isMenuDisplayed = true;
      prepPromises.push(
        WIDGETS["recorder"].setRecording(true).then(() => {
          isMenuDisplayed = false;
          layout.setUI(); // grab our input handling again
          layout.forgetLazyState();
          layout.render();
        })
      );
    } else {
      prepPromises.push(
        WIDGETS["recorder"].setRecording(false)
      );
    }
  }

  if (!prepPromises.length) // fix for Promise.all bug in 2v12
    prepPromises.push(Promise.resolve());

  Promise.all(prepPromises)
    .then(() => {
    if (running) {
      exs.start();
    } else {
      exs.stop();
    }
    layout.button.label = running ? "STOP" : "START";
    layout.status.label = running ? "RUN" : "STOP";
    layout.status.bgCol = running ? "#0f0" : "#f00";
    // if stopping running, don't clear state
    // so we can at least refer to what we've done
    layout.render();
  });
}

let lc = [];
// Load stats in pair by pair
for (let i=0;i<statIDs.length;i+=2) {
  let sa = exs.stats[statIDs[i+0]]
  let sb = exs.stats[statIDs[i+1]];
  lc.push({ type:"h", filly:1, c:[
    sa?{type:"txt", font:fontHeading, label:sa.title.toUpperCase(), fillx:1, col:headingCol }:{},
    sb?{type:"txt", font:fontHeading, label:sb.title.toUpperCase(), fillx:1, col:headingCol }:{}
  ]}, { type:"h", filly:1, c:[
    sa?{type:"txt", font:fontValue, label:sa.getString(), id:sa.id, fillx:1 }:{},
    sb?{type:"txt", font:fontValue, label:sb.getString(), id:sb.id, fillx:1 }:{}
  ]});
  if (sa) sa.on('changed', e=>layout[e.id].label = e.getString());
  if (sb) sb.on('changed', e=>layout[e.id].label = e.getString());
}
// At the bottom put time/GPS state/etc
lc.push({ type:"h", filly:1, c:[
  {type:"txt", font:fontHeading, label:"GPS", id:"gps", fillx:1, bgCol:"#f00" },
  {type:"txt", font:fontHeading, label:"00:00", id:"clock", fillx:1, bgCol:g.theme.fg, col:g.theme.bg },
  {type:"txt", font:fontHeading, label:"STOP", id:"status", fillx:1 }
]});
// Now calculate the layout
let layout = new Layout( {
  type:"v", c: lc
},{lazy:true, btns:[{ label:"START", cb: ()=>{if (karvonnenActive) {stopKarvonnenUI();run();}; onStartStop();}, id:"button"}]});
delete lc;
layout.render();

function configureNotification(stat) {
  stat.on('notify', (e)=>{
    settings.notify[e.id].notifications.reduce(function (promise, buzzPattern) {
      return promise.then(function () {
        return Bangle.buzz(buzzPattern[0], buzzPattern[1]);
      });
    }, Promise.resolve());
  });
}

Object.keys(settings.notify).forEach((statType) => {
  if (settings.notify[statType].increment > 0 && exs.stats[statType]) {
    configureNotification(exs.stats[statType]);
  }
});

// Handle GPS state change for icon
Bangle.on("GPS", function(fix) {
  layout.gps.bgCol = fix.fix ? "#0f0" : "#f00";
  if (!fix.fix) return; // only process actual fixes
  if (fixCount++ === 0) {
    Bangle.buzz(); // first fix, does not need to respect quiet mode
  }
});

// run() function used to switch between traditional run UI and karvonnen UI
function run() {
  wu.show();
  layout.lazy = false;
  layout.render();
  layout.lazy = true;
  // We always call ourselves once a second to update
  if (!runInterval){
    runInterval = setInterval(function() {
      layout.clock.label = locale.time(new Date(),1);
      if (!isMenuDisplayed && !karvonnenActive) layout.render();
    }, 1000);
  }
}
run();

///////////////////////////////////////////////
//                Karvonnen
///////////////////////////////////////////////

function stopRunUI() {
  // stop updating and drawing the traditional run app UI
  clearInterval(runInterval);
  runInterval = undefined;
  karvonnenActive = true;
}

function stopKarvonnenUI() {
  g.reset().clear();
  clearInterval(karvonnenInterval);
  karvonnenInterval = undefined;
  karvonnenActive = false;
}

let karvonnenInterval;
// Define the function to go back and foth between the different UI's
function swipeHandler(LR,_) {
  if (LR==-1 && karvonnenActive && !isMenuDisplayed) {stopKarvonnenUI(); run();}
  if (LR==1 && !karvonnenActive && !isMenuDisplayed) {stopRunUI(); karvonnenInterval = require("run_karvonnen").show(settings.HRM, exs.stats.bpm);}
}
// Listen for swipes with the swipeHandler
Bangle.on("swipe", swipeHandler);
