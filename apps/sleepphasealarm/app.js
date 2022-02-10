const BANGLEJS2 = process.env.HWVERSION == 2; //# check for bangle 2
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

function drawString(s, y) { //# replaced x: always centered
  g.reset(); //# moved up to prevent blue background
  g.clearRect(0, y - 12, 239, y + 8); //# minimized upper+lower clearing
  g.setFont("Vector", 20);
  g.setFontAlign(0, 0); // align centered
  g.drawString(s, g.getWidth() / 2, y); //# set x to center
}

function drawApp() {
  g.clearRect(0,24,239,215); //# no problem
  var alarmHour = nextAlarm.getHours();
  var alarmMinute = nextAlarm.getMinutes();
  if (alarmHour < 10) alarmHour = "0" + alarmHour;
  if (alarmMinute < 10) alarmMinute = "0" + alarmMinute;
  const s = "Alarm at " + alarmHour + ":" + alarmMinute + "\n\n"; //# make distinct to time
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
      const time = nowHour + ":" + nowMinute + (BANGLEJS2 ? "" : ":" + nowSecond); //# hide seconds on bangle 2
      drawString(time, BANGLEJS2 ? 85 : 105); //# remove x, adjust height for bangle 2 an newer firmware
    }
  }

  if (BANGLEJS2) {
    drawTime();
    setTimeout(_ => {
      drawTime();
      setInterval(drawTime, 60000);
    }, 60000 - Date.now() % 60000); //# every new minute on bangle 2
  } else {
    setInterval(drawTime, 500); // 2Hz
  }
}

var buzzCount = 19;
function buzz() {
  if ((require('Storage').readJSON('setting.json',1)||{}).quiet>1) return; // total silence
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
  Bangle.loadWidgets(); //# correct widget load draw order
  Bangle.drawWidgets();

  // minimum alert 30 minutes early
  minAlarm.setTime(nextAlarm.getTime() - (30*60*1000));
  setInterval(function() {
    const now = new Date();
    const acc = Bangle.getAccel().mag;
    const swest = calc_ess(acc);

    if (swest !== undefined) {
      if (Bangle.isLCDOn()) {
        drawString(swest ? "Sleep" : "Awake", BANGLEJS2 ? 150 : 180); //# remove x, adjust height
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
// BTN2 to menu, BTN3 to main # on bangle 2 only BTN to main
if (!BANGLEJS2) setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
setWatch(() => load(), BANGLEJS2 ? BTN : BTN3, { repeat: false, edge: "falling" });
