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
  let sa = exs.stats[statIDs[i+0]];
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
},{lazy:true, btns:[{ label:"START", cb: onStartStop, id:"button"}]});
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
  if (karvonnenActive) g.reset().clear();
  karvonnenActive = false;
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

// Korvonnen pasted inside a function
function karvonnen() {
  // stop updating and drawing the traditional run app UI
  clearInterval(runInterval);
  runInterval = undefined;
  karvonnenActive = true;
  //This app is an extra feature implementation for the Run.app of the bangle.js. It's called run+
  //The calculation of the Heart Rate Zones is based on the Karvonnen method. It requires to know maximum and minimum heart rates. More precise calculation methods require a lab.
  //Other methods are even more approximative.
  wu.hide();
  let R = Bangle.appRect;
  
  g.reset().clearRect(R);
  
  g.drawLine(40,64,88,52,136,64);
  g.drawLine(88,52,136,64);
  g.drawLine(40,112,88,124);
  g.drawLine(88,124,132,112);
  g.setFont("Vector",20);
  
  //To calculate Heart rate zones, we need to know the heart rate reserve (HRR)
  // HRR = maximum HR - Minimum HR. minhr is minimum hr, maxhr is maximum hr.
  //get the hrr (heart rate reserve).
  // I put random data here, but this has to come as a menu in the settings section so that users can change it.
  let minhr = 48;
  let maxhr = 187;
  
  function calculatehrr(minhr, maxhr) {
    return maxhr - minhr;}
  
  //test input for hrr (it works).
  let hrr = calculatehrr(minhr, maxhr);
  console.log(hrr);
  
  //Test input to verify the zones work. The following value for "hr" has to be deleted and replaced with the Heart Rate Monitor input.
  let hr = 174;
  let hr1 = hr;
  // These letiables display next and previous HR zone.
  //get the hrzones right. The calculation of the Heart rate zones here is based on the Karvonnen method
  //60-70% of HRR+minHR = zone2. //70-80% of HRR+minHR = zone3. //80-90% of HRR+minHR = zone4. //90-99% of HRR+minHR = zone5. //=>99% of HRR+minHR = serious risk of heart attack
  let minzone2 = hrr * 0.6 + minhr;
  let maxzone2 = hrr * 0.7 + minhr;
  let maxzone3 = hrr * 0.8 + minhr;
  let maxzone4 = hrr * 0.9 + minhr;
  let maxzone5 = hrr * 0.99 + minhr;
  
  // HR data: large, readable, in the middle of the screen
  g.setFont("Vector",50);
  g.drawString(hr1, 62,66);
  //These functions call arcs to show different HR zones.
  
  //To shorten the code, I'll reference some letiables and reuse them.
  let centreX = R.x + 0.5 * R.w; //g.getWidth();
  let centreY = R.y + 0.5 * R.h; //g.getWidth();
  let minRadius = 0.38 * R.h; //g.getWidth();
  let maxRadius = 0.50 * R.h; //g.getWidth();
  
  //####### A function to simplify a bit the code ######
  function simplify (sA, eA, Z) {
  const zone= require("graphics_utils");
  let startAngle = zone.degreesToRadians(sA);
  let endAngle = zone.degreesToRadians(eA);
  zone.fillArc(g, centreX, centreY, minRadius, maxRadius, startAngle, endAngle);
  g.drawString(Z, 29,80);}
  
  //####### A function to simplify next&previous zones ######
  function zoning (max, min) {
  g.drawString(max, 56,28);g.drawString(min, 60,128);}
  
  //draw background image (dithered green zones)(I should draw different zones in different dithered colors)
   const HRzones= require("graphics_utils");
   let minRadiusz = 0.44 * g.getWidth();
   let startAngle = HRzones.degreesToRadians(-88.5);
   let endAngle = HRzones.degreesToRadians(268.5);
   g.setColor("#002200");
   HRzones.fillArc(g, centreX, centreY, minRadiusz, maxRadius, startAngle, endAngle);
   g.setFont("Vector",24);
  
  function getzone1() {g.setColor("#00ffff");{(simplify (-88.5, -20, "Z1"));}zoning(minzone2, minhr);}
  function getzone2a() {g.setColor("#00ff00");{(simplify (-43.5, -21.5, "Z2"));}zoning(maxzone2, minzone2);}
  function getzone2b() {g.setColor("#00ff00");{(simplify (-20, 1.5, "Z2"));}zoning(maxzone2, minzone2);}
  function getzone2c() {g.setColor("#00ff00");{(simplify (3, 24, "Z2"));}zoning(maxzone2, minzone2);}
  function getzone3a() {g.setColor("#ffff00");{(simplify (25.5, 46.5, "Z3"));}zoning(maxzone3, maxzone2);}
  function getzone3b() {g.setColor("#ffff00");{(simplify (48, 69, "Z3"));}zoning(maxzone3, maxzone2);}
  function getzone3c() {g.setColor("#ffff00");{(simplify (70.5, 91.5, "Z3"));}zoning(maxzone3, maxzone2);}
  function getzone4a() {g.setColor("#ff8000");{(simplify (91, 114.5, "Z4"));}zoning(maxzone4, maxzone3);}
  function getzone4b() {g.setColor("#ff8000");{(simplify (116, 137.5, "Z4"));}zoning(maxzone4, maxzone3);}
  function getzone4c() {g.setColor("#ff8000");{(simplify (139, 160, "Z4"));}zoning(maxzone4, maxzone3);}
  function getzone5a() {g.setColor("#ff0000");{(simplify (161.5, 182.5, "Z5"));}zoning(maxzone5, maxzone4);}
  function getzone5b() {g.setColor("#ff0000");{(simplify (184, 205, "Z5"));}zoning(maxzone5, maxzone4);}
  function getzone5c() {g.setColor("#ff0000");{(simplify (206.5, 227.5, "Z5"));}zoning(maxzone5, maxzone4);}
  
  function getzonealert() {
   const HRzonemax = require("graphics_utils");
   let centreX1,centreY1,maxRadius1 = 1;
   let minRadius = 0.40 * g.getWidth();
   let startAngle1 = HRzonemax.degreesToRadians(-90);
   let endAngle1 = HRzonemax.degreesToRadians(270);
   g.setFont("Vector",38);g.setColor("#ff0000");
   HRzonemax.fillArc(g, centreX, centreY, minRadius, maxRadius, startAngle1, endAngle1);
   g.drawString("ALERT", 26,66);
  }
  //Subdivided zones for better readability of zones when calling the images. //Changing HR zones will trigger the function with the image and previous&next HR zones.
  
    if (hr <= hrr*0.6 + minhr) {(getzone1());
  } else if (hr <= hrr*0.64 + minhr) {(getzone2a());
  } else if (hr <= hrr*0.67+minhr) {(getzone2b());
  } else if (hr <= hrr * 0.7 + minhr) {(getzone2c());
  } else if (hr <= hrr * 0.74 + minhr) {(getzone3a());
  } else if (hr <= hrr * 0.77 + minhr) {(getzone3b());
  } else if (hr <= hrr * 0.8 + minhr) {(getzone3c());
  } else if (hr <= hrr * 0.84 + minhr) {(getzone4a());
  } else if (hr <= hrr * 0.87 + minhr) {(getzone4b());
  } else if (hr <= hrr * 0.9 + minhr) {(getzone4c());
  } else if (hr <= hrr * 0.94 + minhr) {(getzone5a());
  } else if (hr <= hrr * 0.96 + minhr) {(getzone5b());
  } else if (hr <= hrr * 0.98 + minhr) {(getzone5c());
  } else if (hr >= maxhr - 2) {g.clear();(getzonealert());}
}

// Define the function to go back and foth between the different UI's
function swipeHandler(LR,_) {
  if (LR==-1 && karvonnenActive && !isMenuDisplayed) run();
  if (LR==1 && !karvonnenActive && !isMenuDisplayed) karvonnen();
}

// Listen for swipes with the swipeHandler
Bangle.on("swipe", swipeHandler);
