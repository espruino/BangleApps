var ExStats = require("exstats");
var B2 = process.env.HWVERSION===2;
var Layout = require("Layout");
var locale = require("locale");
var fontHeading = "6x8:2";
var fontValue = B2 ? "6x15:2" : "6x8:3";
var headingCol = "#888";
var fixCount = 0;
var isMenuDisplayed = false;

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

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
  },
}, require("Storage").readJSON("run.json", 1) || {});
var statIDs = [settings.B1,settings.B2,settings.B3,settings.B4,settings.B5,settings.B6].filter(s=>s!=="");
var exs = ExStats.getStats(statIDs, settings);
// ---------------------------

function setStatus(running) {
  layout.button.label = running ? "STOP" : "START";
  layout.status.label = running ? "RUN" : "STOP";
  layout.status.bgCol = running ? "#0f0" : "#f00";
  layout.render();
}

// Called to start/stop running
function onStartStop() {
  var running = !exs.state.active;
  var shouldResume = false;
  var promise = Promise.resolve();

  if (running && exs.state.duration > 10000) { // if more than 10 seconds of duration, ask if we should resume?
    promise = promise.
      then(() => {
        isMenuDisplayed = true;
        return E.showPrompt("Resume run?",{title:"Run"});
      }).then(r => {
        isMenuDisplayed = false;
        layout.setUI(); // grab our input handling again
        layout.forgetLazyState();
        layout.render();
        shouldResume = r;
      });
  }

  // start/stop recording
  // Do this first in case recorder needs to prompt for
  // an overwrite before we start tracking exstats
  if (settings.record && WIDGETS["recorder"]) {
    if (running) {
      isMenuDisplayed = true;
      promise = promise.
        then(() => WIDGETS["recorder"].setRecording(true, { force : shouldResume?"append":undefined })).
        then(() => {
          isMenuDisplayed = false;
          layout.setUI(); // grab our input handling again
          layout.forgetLazyState();
          layout.render();
        });
    } else {
      promise = promise.then(
        () => WIDGETS["recorder"].setRecording(false)
      );
    }
  }

  promise.then(() => {
    if (running) {
      if (shouldResume)
        exs.resume()
      else
        exs.start();
    } else {
      exs.stop();
    }
    // if stopping running, don't clear state
    // so we can at least refer to what we've done
    setStatus(running);
  });
}

var lc = [];
// Load stats in pair by pair
for (var i=0;i<statIDs.length;i+=2) {
  var sa = exs.stats[statIDs[i+0]];
  var sb = exs.stats[statIDs[i+1]];
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
  {type:"txt", font:fontHeading, label:"---", id:"status", fillx:1 }
]});
// Now calculate the layout
var layout = new Layout( {
  type:"v", c: lc
},{lazy:true, btns:[{ label:"---", cb: onStartStop, id:"button"}]});
delete lc;
setStatus(exs.state.active);
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
// We always call ourselves once a second to update
setInterval(function() {
  layout.clock.label = locale.time(new Date(),1);
  if (!isMenuDisplayed) layout.render();
}, 1000);
