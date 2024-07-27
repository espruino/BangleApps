const BANGLEJS2 = process.env.HWVERSION == 2; // check for bangle 2
const CONFIGFILE = "sleepphasealarm.json";
const Layout = require("Layout");
const locale = require('locale');
const alarms = require("Storage").readJSON("sched.json",1) || [];
const config = Object.assign({
    logs: [], // array of length 31 with one entry for each day of month
    settings: {
        startBeforeAlarm: 0, // 0 = start immediately, 1..23 = start 1h..23h before alarm time
        disableAlarm: false,
    }
}, require("Storage").readJSON(CONFIGFILE,1) || {});
const active = alarms.filter(alarm => require("sched").getTimeToAlarm(alarm));
const schedSettings = require("sched").getSettings();
let buzzCount = schedSettings.buzzCount;
let logs = [];
let drawTimeTimeout;

// Sleep/Wake detection with Estimation of Stationary Sleep-segments (ESS):
// Marko Borazio, Eugen Berlin, Nagihan Kücükyildiz, Philipp M. Scholl and Kristof Van Laerhoven, "Towards a Benchmark for Wearable Sleep Analysis with Inertial Wrist-worn Sensing Units", ICHI 2014, Verona, Italy, IEEE Press, 2014.
// https://ubicomp.eti.uni-siegen.de/home/datasets/ichi14/index.html.en
//
// Function needs to be called for every measurement but returns a value at maximum once a second (see winwidth)
// start of sleep marker is delayed by sleepthresh due to continous data reading
const winwidth=13; // Actually 12.5 Hz, rounded
const nomothresh=0.023; // Original implementation: 6, resolution 11 bit, scale +-4G = 6/(2^(11-1))*4 = 0.023438 in G
const sleepthresh=600;
var ess_values = [];
var slsnds = 0;
function calc_ess(acc_magn) {"ram"
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
var nextAlarmDate;
var nextAlarmConfig;
active.forEach(alarm => {
  const now = new Date();
  const time = require("time_utils").decodeTime(alarm.t);
  var dateAlarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.h, time.m);
  if (dateAlarm < now) { // dateAlarm in the past, add 24h
    dateAlarm.setTime(dateAlarm.getTime() + (24*60*60*1000));
  }
  if ((alarm.dow >> dateAlarm.getDay()) & 1) { // check valid day of week
    if (nextAlarmDate === undefined || dateAlarm < nextAlarmDate) {
      nextAlarmDate = dateAlarm;
      nextAlarmConfig = alarm;
    }
  }
});

const LABEL_ETA = /*LANG*/"ETA";
const LABEL_WAKEUP_TIME = /*LANG*/"Alarm at";

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
  var alarmHour = nextAlarmDate.getHours();
  var alarmMinute = nextAlarmDate.getMinutes();
  if (alarmHour < 10) alarmHour = "0" + alarmHour;
  if (alarmMinute < 10) alarmMinute = "0" + alarmMinute;
  layout.alarm_date.label = `${LABEL_WAKEUP_TIME}: ${alarmHour}:${alarmMinute}`;
  layout.render();

  function drawTime() {"ram"
    const drawSeconds = !Bangle.isLocked();

    if (Bangle.isLCDOn()) {
      const now = new Date();
      layout.date.label = locale.time(now, !drawSeconds); // hide seconds on bangle 2
      const diff = nextAlarmDate - now;
      const diffHour = Math.floor((diff % 86400000) / 3600000).toString();
      const diffMinutes = Math.floor(((diff % 86400000) % 3600000) / 60000).toString();
      layout.eta.label = `${LABEL_ETA}: ${diffHour}:${diffMinutes.padStart(2, '0')}`;
      layout.render();
    }

    const period = drawSeconds ? 1000 : 60000;
    if (drawTimeTimeout !== undefined) {
      clearTimeout(drawTimeTimeout);
    }
    drawTimeTimeout = setTimeout(()=>{
      drawTimeTimeout = undefined;
      drawTime();
    }, period - (Date.now() % period));
  }

  Bangle.on('lock', function(on) {
    if (on === false) {
      drawTime();
    }
  });

  drawTime();
}

function buzz() {
  if ((require('Storage').readJSON('setting.json',1)||{}).quiet>1) return; // total silence
  Bangle.setLCDPower(1);
  require("buzz").pattern(nextAlarmConfig.vibrate || ";");
  if (buzzCount--) {
    setTimeout(buzz, schedSettings.buzzIntervalMillis);
  } else {
    // back to main after finish
    setTimeout(load, 1000);
  }
}

function addLog(time, type) {
  logs.push({time: time.toISOString(), type: type});
  if (logs.length > 1) { // Do not write if there is only one state
    require("Storage").writeJSON(CONFIGFILE, config);
  }
}

// run
var minAlarm = new Date();
var measure = true;
if (nextAlarmDate !== undefined) {
  const logday = BANGLEJS2 ? nextAlarmDate.getDate() : 0;
  config.logs[logday] = []; // overwrite log on each day of month
  logs = config.logs[logday];
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  let swest_last;

  // minimum alert 30 minutes early
  minAlarm.setTime(nextAlarmDate.getTime() - (30*60*1000));
  let run = () => {
    layout.state.label = /*LANG*/"Start";
    layout.render();
    Bangle.setOptions({powerSave: false}); // do not dynamically change accelerometer poll interval
    Bangle.setPollInterval(80); // 12.5Hz
    Bangle.on('accel', (accelData) => {"ram"
      const now = new Date();
      const acc = accelData.mag;
      const swest = calc_ess(acc);

      if (swest !== undefined) {
        if (Bangle.isLCDOn()) {
          layout.state.label = swest ? /*LANG*/"Sleep" : /*LANG*/"Awake";
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

      if (now >= nextAlarmDate) {
        // The alarm widget should handle this one
        addLog(now, "alarm");
        setTimeout(load, 1000);
      } else if (measure && now >= minAlarm && swest === false) {
        addLog(now, "alarm");
        measure = false;
        if (nextAlarmConfig.js) {
          eval(nextAlarmConfig.js); // run nextAlarmConfig.js if set
        } else {
          buzz();
          if (config.settings.disableAlarm) {
            // disable alarm for scheduler
            nextAlarmConfig.last = now.getDate();
            require('Storage').writeJSON('sched.json', alarms);
          }
        }
      }
    });
  };
  drawApp();
  if (config.settings.startBeforeAlarm === 0) {
    // Start immediately
    run();
  } else {
    // defer start
    layout.state.label = "Deferred";
    layout.render();
    const diff = nextAlarmDate - Date.now();
    let timeout = diff-config.settings.startBeforeAlarm*60*60*1000;
    if (timeout < 0) timeout = 0;
    setTimeout(run, timeout);
  }
} else {
  E.showMessage('No Alarm');
  setTimeout(load, 1000);
}
setWatch(() => load(), BANGLEJS2 ? BTN : BTN3, { repeat: false, edge: "falling" });
