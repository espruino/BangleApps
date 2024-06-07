let runInterval;
let screen = "main"; // main | karvonen | menu | zoom
// Run interface wrapped in a function
const ExStats = require("exstats");
let B2 = process.env.HWVERSION===2;
let Layout = require("Layout");
let locale = require("locale");
let fontHeading = "6x8:2";
let fontValue = B2 ? "6x15:2" : "6x8:3";
let zoomFont = "12x20:3";
let zoomFontSmall = "12x20:2";
let headingCol = "#888";
let fixCount = 0;
const wu = require("widget_utils");

g.reset().clear();
Bangle.loadWidgets();

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
  alwaysResume: false,
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
  HRM: {
    min: 55,
    max: 185,
  },
}, require("Storage").readJSON("runplus.json", 1) || {});
let statIDs = [settings.B1,settings.B2,settings.B3,settings.B4,settings.B5,settings.B6].filter(s=>s!=="");
let exs = ExStats.getStats(statIDs, settings);
// ---------------------------

function setStatus(running) {
  layout.button.label = running ? "STOP" : "START";
  layout.status.label = running ? "RUN" : "STOP";
  layout.status.bgCol = running ? "#0f0" : "#f00";
  if (screen === "main") layout.render();
}

// Called to start/stop running
function onStartStop() {
  if (screen === "karvonen") {
    // start/stop on the karvonen screen reverts us to the main screen
    setScreen("main");
  }

  var running = !exs.state.active;
  var shouldResume = settings.alwaysResume;
  var promise = Promise.resolve();

  if (!shouldResume && running && exs.state.duration > 10000) { // if more than 10 seconds of duration, ask if we should resume?
    promise = promise.
      then(() => {
        screen = "menu";
        return E.showPrompt("Resume run?",{title:"Run"});
      }).then(r => {
        screen = "main";
        layout.setUI(); // grab our input handling again
        layout.forgetLazyState();
        layout.render();
        shouldResume=r;
      });
  }

  // start/stop recording
  // Do this first in case recorder needs to prompt for
  // an overwrite before we start tracking exstats
  if (settings.record && WIDGETS["recorder"]) {
    if (running) {
      screen = "menu";
      promise = promise.
        then(() => WIDGETS["recorder"].setRecording(true, { force : shouldResume?"append":undefined })).
        then(() => {
          screen = "main";
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
        exs.resume();
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

function zoom(statID) {
  if (screen !== "main") return;

  setScreen("zoom");

  const onTouch = () => {
    Bangle.removeListener("touch", onTouch);
    Bangle.removeListener("twist", onTwist);
    stat.removeListener("changed", draw);
    setScreen("main");
  };
  Bangle.on("touch", onTouch); // queued after layout's touchHandler (otherwise we'd be removed then instantly re-zoomed)

  const onTwist = () => {
    Bangle.setLCDPower(1);
  };
  Bangle.on("twist", onTwist);

  const draw = stat => {
    const R = Bangle.appRect;

    g.reset()
      .clearRect(R)
      .setFontAlign(0, 0);

    layout.render(layout.bottom);

    const value = exs.state.active ? stat.getString() : "____";

    g
      .setFont(stat.title.length > 5 ? zoomFontSmall : zoomFont)
      .setColor(headingCol)
      .drawString(stat.title.toUpperCase(), R.x+R.w/2, R.y+R.h/3)
      .setColor(g.theme.fg)
      .drawString(value, R.x+R.w/2, R.y+R.h*2/3);
  };
  layout.lazy = false; // restored when we go back to "main"

  const stat = exs.stats[statID];
  stat.on("changed", draw);
  draw(stat);
}

let lc = [];
// Load stats in pair by pair
for (let i=0;i<statIDs.length;i+=2) {
  let sa = exs.stats[statIDs[i+0]];
  let sb = exs.stats[statIDs[i+1]];
  let cba = zoom.bind(null, statIDs[i]);
  let cbb = zoom.bind(null, statIDs[i+1]);
  lc.push({ type:"h", filly:1, c:[
    sa?{type:"txt", font:fontHeading, label:sa.title.toUpperCase(), fillx:1, col:headingCol, cb: cba }:{},
    sb?{type:"txt", font:fontHeading, label:sb.title.toUpperCase(), fillx:1, col:headingCol, cb: cbb }:{}
  ]}, { type:"h", filly:1, c:[
    sa?{type:"txt", font:fontValue, label:sa.getString(), id:sa.id, fillx:1, cb: cba }:{},
    sb?{type:"txt", font:fontValue, label:sb.getString(), id:sb.id, fillx:1, cb: cbb }:{}
  ]});
  if (sa) sa.on('changed', e=>layout[e.id].label = e.getString());
  if (sb) sb.on('changed', e=>layout[e.id].label = e.getString());
}
// At the bottom put time/GPS state/etc
lc.push({ type:"h", id:"bottom", filly:1, c:[
  {type:"txt", font:fontHeading, label:"GPS", id:"gps", fillx:1, bgCol:"#f00" },
  {type:"txt", font:fontHeading, label:"00:00", id:"clock", fillx:1, bgCol:g.theme.fg, col:g.theme.bg },
  {type:"txt", font:fontHeading, label:"---", id:"status", fillx:1 }
]});
// Now calculate the layout
let layout = new Layout( {
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

function setScreen(to) {
  if (screen === "karvonen") {
    require("runplus_karvonen").stop();
    wu.show();
    Bangle.drawWidgets();
  }

  if (runInterval) clearInterval(runInterval);
  runInterval = undefined;
  g.reset().clearRect(Bangle.appRect);

  screen = to;
  switch (screen) {
    case "main":
      layout.lazy = false;
      layout.render();
      layout.lazy = true;
      // We always call ourselves once a second to update
      if (!runInterval){
        runInterval = setInterval(function() {
          layout.clock.label = locale.time(new Date(),1);
          if (screen !== "menu") layout.render();
        }, 1000);
      }
      break;

    case "karvonen":
      require("runplus_karvonen").start(settings.HRM, exs.stats.bpm);
      break;
  }
}

// Define the function to go back and forth between the different UI's
function swipeHandler(LR,_) {
  if (screen !== "menu"){
    if (LR < 0 && screen == "karvonen")
      setScreen("main");
    if (LR > 0 && screen !== "karvonen")
      setScreen("karvonen"); // stop updating and drawing the traditional run app UI
  }
}

setScreen("main");

// Listen for swipes with the swipeHandler
Bangle.on("swipe", swipeHandler);
