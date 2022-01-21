var timerclkTimerTimeout;
var timerclkAlarmTimeout;
function timerclkCheckTimers() {
  if (timerclkTimerTimeout) clearTimeout(timerclkTimerTimeout);
  var timers = require('Storage').readJSON('timerclk.timer.json',1)||[];
  timers = timers.filter(e=>e.start);
  if (timers.length) {
    timers = timers.sort((a,b)=>{
      var at = a.timeAdd;
      if (a.start) at += Date.now()-a.start;
      at = a.period-at;
      var bt = b.timeAdd;
      if (b.start) bt += Date.now()-b.start;
      bt = b.period-bt;
      return at-bt;
    });
    if (!require('Storage').read("timerclk.timer.alert.js")) {
      console.log("No timer app!");
    } else {
      var time = timers[0].timeAdd;
      if (timers[0].start) time += Date.now()-timers[0].start;
      time = timers[0].time - time;
      if (time<1000) t=1000;
      if (timerclkTimerTimeout) clearTimeout(timerclkTimerTimeout);
      timerclkTimerTimeout = setTimeout(() => load("timerclk.timer.alert.js"),time);
    }
  }
}
function timerclkCheckAlarms() {
  if (timerclkAlarmTimeout) clearTimeout(timerclkAlarmTimeout);
  var alarms = require('Storage').readJSON('timerclk.alarm.json',1)||[];
  var currentTime = require("timerclk.lib.js").getCurrentTime();
  alarms = alarms.filter(e=>e.on);
  if (alarms.length) {
    alarms = alarms.sort((a,b)=>(a.time-b.time)+(a.last-b.last)*86400000);
    if (!require('Storage').read("timerclk.alarm.alert.js")) {
      console.log("No alarm app!");
    } else {
      var time = alarms[0].time-currentTime;
      if (alarms[0].last == new Date().getDate() || time < 0) time += 86400000;
      if (time<1000) t=1000;
      if (timerclkAlarmTimeout) clearTimeout(timerclkAlarmTimeout);
      timerclkAlarmTimeout = setTimeout(() => load("timerclk.alarm.alert.js"),time);
    }
  }
}
timerclkCheckTimers();
timerclkCheckAlarms();
