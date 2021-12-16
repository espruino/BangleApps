/**
 * This file checks for upcoming alarms and schedules qalarm.js to deal with them and itself to continue doing these checks.
 */

print("Checking for alarms...");

if (Bangle.QALARM) {
  clearInterval(Bangle.QALARM);
  Bangle.QALARM = undefined;
}

function getCurrentTime() {
  let time = new Date();
  return (
    time.getHours() * 3600000 +
    time.getMinutes() * 60000 +
    time.getSeconds() * 1000
  );
}

let time = new Date();
let t = getCurrentTime();

let nextAlarms = (require("Storage").readJSON("qalarm.json", 1) || [])
  .filter(
    (alarm) =>
      alarm.on &&
      alarm.t > t &&
      alarm.last != time.getDate() &&
      (alarm.timer || alarm.daysOfWeek[time.getDay()])
  )
  .sort((a, b) => a.t - b.t);

if (nextAlarms[0]) {
  Bangle.QALARM = setTimeout(() => {
    eval(require("Storage").read("qalarmcheck.js"));
    load("qalarm.js");
  }, nextAlarms[0].t - t);
} else {
  // No alarms found: will re-check at midnight
  Bangle.QALARM = setTimeout(() => {
    eval(require("Storage").read("qalarmcheck.js"));
  }, 86400000 - t);
}
