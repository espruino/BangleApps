const BANGLEJS2 = process.env.HWVERSION == 2; // check for bangle 2
const Layout = require("Layout");
const locale = require('locale');
const alarms = require("Storage").readJSON("sched.json",1) || [];
const config = require("Storage").readJSON("sleepphasealarm.json",1) || {logs: []};
const active = alarms.filter(a=>a.on);
let logs = [];

// Sleep/Wake detection with Estimation of Stationary Sleep-segments (ESS):
// Marko Borazio, Eugen Berlin, Nagihan Kücükyildiz, Philipp M. Scholl and Kristof Van Laerhoven, "Towards a Benchmark for Wearable Sleep Analysis with Inertial Wrist-worn Sensing Units", ICHI 2014, Verona, Italy, IEEE Press, 2014.
// https://ubicomp.eti.uni-siegen.de/home/datasets/ichi14/index.html.en
//
// Function needs to be called for every measurement but returns a value at maximum once a second (see winwidth)
// start of sleep marker is delayed by sleepthresh due to continous data reading
const winwidth=13;
const nomothresh=0.03; // 0.006 was working on Bangle1, but Bangle2 has higher noise.
const sleepthresh=600;
var ess_values = [];
var slsnds = 0;
function calc_ess(acc_magn) {
  ess_values.push(acc_magn);

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
        return true; // sleep
      }
    } else {
      slsnds=0;
      return false; // awake
    }
  }
}

// locate next alarm
var nextAlarm;
active.forEach(alarm => {
  const now = new Date();
  const time = require("time_utils").decodeTime(alarm.t);
  var dateAlarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.h, time.m);
  if (dateAlarm < now) { // dateAlarm in the past, add 24h
    dateAlarm.setTime(dateAlarm.getTime() + (24*60*60*1000));
  }
  if ((alarm.dow >> dateAlarm.getDay()) & 1) { // check valid day of week
    if (nextAlarm === undefined || dateAlarm < nextAlarm) {
      nextAlarm = dateAlarm;
    }
  }
});

var layout = new Layout({
  type:"v", c: [
    {type:"txt", font:"10%", label:"Sleep Phase Alarm", bgCol:g.theme.bgH, fillx: true, height:Bangle.appRect.h/6},
    {type:"txt", font:"16%", label: ' '.repeat(20), id:"date", height:Bangle.appRect.h/6},
    {type:"txt", font:"12%", label: "", id:"alarm_date", height:Bangle.appRect.h/6},
    {type:"txt", font:"10%", label: ' '.repeat(20), id:"eta", height:Bangle.appRect.h/6},
    {type:"txt", font:"12%", label: ' '.repeat(20), id:"state", height:Bangle.appRect.h/6},
  ]
}, {lazy:true});

function drawApp() {
  var alarmHour = nextAlarm.getHours();
  var alarmMinute = nextAlarm.getMinutes();
  if (alarmHour < 10) alarmHour = "0" + alarmHour;
  if (alarmMinute < 10) alarmMinute = "0" + alarmMinute;
  layout.alarm_date.label = "Alarm at " + alarmHour + ":" + alarmMinute;
  layout.render();

  function drawTime() {
    if (Bangle.isLCDOn()) {
      const now = new Date();
      layout.date.label = locale.time(now, BANGLEJS2 && Bangle.isLocked() ? 1 : 0); // hide seconds on bangle 2
      const diff = nextAlarm - now;
      const diffHour = Math.floor((diff % 86400000) / 3600000).toString();
      const diffMinutes = Math.floor(((diff % 86400000) % 3600000) / 60000).toString();
      layout.eta.label = "ETA: -"+ diffHour + ":" + diffMinutes.padStart(2, '0');
      layout.render();
    }
  }

  drawTime();
  setInterval(drawTime, 500); // 2Hz
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

function addLog(time, type) {
  logs.push({time: time, type: type});
  require("Storage").writeJSON("sleepphasealarm.json", config);
}

// run
var minAlarm = new Date();
var measure = true;
if (nextAlarm !== undefined) {
  config.logs[nextAlarm.getDate()] = []; // overwrite log on each day of month
  logs = config.logs[nextAlarm.getDate()];
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  let swest_last;

  // minimum alert 30 minutes early
  minAlarm.setTime(nextAlarm.getTime() - (30*60*1000));
  Bangle.on('accel', (accelData) => { // 12.5Hz
    const now = new Date();
    const acc = accelData.mag;
    const swest = calc_ess(acc);

    if (swest !== undefined) {
      if (Bangle.isLCDOn()) {
        layout.state.label = swest ? "Sleep" : "Awake";
        layout.render();
      }
      // log
      if (swest_last != swest) {
        if (swest) {
          addLog(new Date(now - sleepthresh*13/12.5*1000), "sleep"); // calculate begin of no motion phase, 13 values/second at 12.5Hz
        } else {
          addLog(now, "awake");
        }
        swest_last = swest;
      }
    }

    if (now >= nextAlarm) {
      // The alarm widget should handle this one
      addLog(now, "alarm");
      setTimeout(load, 1000);
    } else if (measure && now >= minAlarm && swest === false) {
      addLog(now, "alarm");
      buzz();
      measure = false;
    }
  });
  drawApp();
} else {
  E.showMessage('No Alarm');
  setTimeout(load, 1000);
}
setWatch(() => load(), BANGLEJS2 ? BTN : BTN3, { repeat: false, edge: "falling" });
