var ExStats = require("exstats");
var B2 = process.env.HWVERSION==2;
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
  record : true,
  B1 : "dist",
  B2 : "time",
  B3 : "pacea",
  B4 : "bpm",
  B5 : "step",
  B6 : "caden",
  paceLength : 1000
}, require("Storage").readJSON("run.json", 1) || {});
var statIDs = [settings.B1,settings.B2,settings.B3,settings.B4,settings.B5,settings.B6].filter(s=>s!="");
var exs = ExStats.getStats(statIDs, settings);
// ---------------------------

// Called to start/stop running
function onStartStop() {
  var running = !exs.state.active;
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
  // start/stop recording
  if (settings.record && WIDGETS["recorder"]) {
    if (running) {
      isMenuDisplayed = true;
      WIDGETS["recorder"].setRecording(true).then(() => {
        isMenuDisplayed = false;
        layout.forgetLazyState();
        layout.render();
      });
    } else {
      WIDGETS["recorder"].setRecording(false);
    }
  }
}

var lc = [];
// Load stats in pair by pair
for (var i=0;i<statIDs.length;i+=2) {
  var sa = exs.stats[statIDs[i+0]];
  var sb = exs.stats[statIDs[i+1]];
  lc.push({ type:"h", filly:1, c:[
    {type:"txt", font:fontHeading, label:sa.title.toUpperCase(), fillx:1, col:headingCol },
    {type:"txt", font:fontHeading, label:sb.title.toUpperCase(), fillx:1, col:headingCol }
  ]}, { type:"h", filly:1, c:[
    {type:"txt", font:fontValue, label:sa.getString(), id:sa.id, fillx:1 },
    {type:"txt", font:fontValue, label:sb.getString(), id:sb.id, fillx:1 }
  ]});
  sa.on('changed', e=>layout[e.id].label = e.getString());
  sb.on('changed', e=>layout[e.id].label = e.getString());
}
// At the bottom put time/GPS state/etc
lc.push({ type:"h", filly:1, c:[
  {type:"txt", font:fontHeading, label:"GPS", id:"gps", fillx:1, bgCol:"#f00" },
  {type:"txt", font:fontHeading, label:"00:00", id:"clock", fillx:1, bgCol:g.theme.fg, col:g.theme.bg },
  {type:"txt", font:fontHeading, label:"STOP", id:"status", fillx:1 }
]});
// Now calculate the layout
var layout = new Layout( {
  type:"v", c: lc
},{lazy:true, btns:[{ label:"START", cb: onStartStop, id:"button"}]});
delete lc;
layout.render();

// Handle GPS state change for icon
Bangle.on("GPS", function(fix) {
  layout.gps.bgCol = fix.fix ? "#0f0" : "#f00";
  if (!fix.fix) return; // only process actual fixes
  if (fixCount++ == 0) {
    Bangle.buzz(); // first fix, does not need to respect quiet mode
  }
});
// We always call ourselves once a second to update
setInterval(function() {
  layout.clock.label = locale.time(new Date(),1);
  if (!isMenuDisplayed) layout.render();
}, 1000);
