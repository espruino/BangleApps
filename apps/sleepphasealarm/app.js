const alarms = require("Storage").readJSON("alarm.json",1)||[];
const active = alarms.filter(a=>a.on);

// Sleep/Wake detection with Estimation of Stationary Sleep-segments (ESS):
// Marko Borazio, Eugen Berlin, Nagihan Kücükyildiz, Philipp M. Scholl and Kristof Van Laerhoven, "Towards a Benchmark for Wearable Sleep Analysis with Inertial Wrist-worn Sensing Units", ICHI 2014, Verona, Italy, IEEE Press, 2014.
// https://ubicomp.eti.uni-siegen.de/home/datasets/ichi14/index.html.en
//
// Function needs to be called for every measurement but returns a value at maximum once a second (see winwidth)
// start of sleep marker is delayed by sleepthresh due to continous data reading
const winwidth=13;
const nomothresh=0.006;
const sleepthresh=600;
var ess_values = [];
var slsnds = 0;
function calc_ess(val) {
  ess_values.push(val);

  if (ess_values.length == winwidth) {
    // calculate standard deviation over ~1s 
    const mean = ess_values.reduce((prev,cur) => cur+prev) / ess_values.length;
    const stddev = Math.sqrt(ess_values.map(val => Math.pow(val-mean,2)).reduce((prev,cur) => prev+cur)/ess_values.length);
    ess_values = [];

    // check for non-movement according to the threshold
    const nonmot = stddev < nomothresh;

    // amount of seconds within non-movement sections
    if (nonmot) {
      slsnds+=1;
      if (slsnds >= sleepthresh) {
        return true; // awake
      }
    } else {
      slsnds=0;
      return false; // sleep
    }
  }
}

// locate next alarm
var nextAlarm;
active.forEach(alarm => {
  const now = new Date();
  const alarmHour = alarm.hr/1;
  const alarmMinute = Math.round((alarm.hr%1)*60);
  var dateAlarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarmHour, alarmMinute);
  if (dateAlarm < now) { // dateAlarm in the past, add 24h
    dateAlarm.setTime(dateAlarm.getTime() + (24*60*60*1000));
  }
  if (nextAlarm === undefined || dateAlarm < nextAlarm) {
    nextAlarm = dateAlarm;
  }
});

function drawString(s, x, y) {
  g.clearRect(0,y-15,239,y+15);
  g.reset();
  g.setFont("Vector",20);
  g.setFontAlign(0,0); // align right bottom
  g.drawString(s, x, y);
}

function drawApp() {
  g.clearRect(0,24,239,215);
  var alarmHour = nextAlarm.getHours();
  var alarmMinute = nextAlarm.getMinutes();
  if (alarmHour < 10) alarmHour = "0" + alarmHour;
  if (alarmMinute < 10) alarmMinute = "0" + alarmMinute;
  const s = alarmHour + ":" + alarmMinute + "\n\n";
  E.showMessage(s, "Sleep Phase Alarm");

  function drawTime() {
    if (Bangle.isLCDOn()) {
      const now = new Date();
      var nowHour = now.getHours();
      var nowMinute = now.getMinutes();
      var nowSecond = now.getSeconds();
      if (nowHour < 10) nowHour = "0" + nowHour;
      if (nowMinute < 10) nowMinute = "0" + nowMinute;
      if (nowSecond < 10) nowSecond = "0" + nowSecond;
      const time = nowHour + ":" + nowMinute + ":" + nowSecond;
      drawString(time, 120, 140);
    }
  }

  setInterval(drawTime, 500); // 2Hz
}

var buzzCount = 19;
function buzz() {
  Bangle.setLCDPower(1);
  Bangle.buzz().then(()=>{
    if (buzzCount--) {
      setTimeout(buzz, 500);
    } else {
      // back to main after finish
      setTimeout(load, 1000);
    }
  });
}

// run
var minAlarm = new Date();
var measure = true;
if (nextAlarm !== undefined) {
  Bangle.drawWidgets();
  Bangle.loadWidgets();

  // minimum alert 30 minutes early
  minAlarm.setTime(nextAlarm.getTime() - (30*60*1000));
  setInterval(function() {
    const now = new Date();
    const acc = Bangle.getAccel().mag;
    const swest = calc_ess(acc);

    if (swest !== undefined) {
      if (Bangle.isLCDOn()) {
        drawString(swest ? "Sleep" : "Awake", 120, 180);
      }
    }

    if (now >= nextAlarm) {
      // The alarm widget should handle this one
      setTimeout(load, 1000);
    } else if (measure && now >= minAlarm && swest === false) {
      buzz();
      measure = false;
    }
  }, 80); // 12.5Hz
  drawApp();
} else {
  E.showMessage('No Alarm');
  setTimeout(load, 1000);
}
// BTN2 to menu, BTN3 to main
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
setWatch(() => load(), BTN3, { repeat: false, edge: "falling" });
