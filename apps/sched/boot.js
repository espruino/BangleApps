// check for alarms
(function() { // run in closure to ensure allocated vars get removed
  if (Bangle.SCHED) {
    clearTimeout(Bangle.SCHED);
    delete Bangle.SCHED;
  }
  delete E.setTimeZone; // delete any modified setTimeZone we added below
  var alarms = require('Storage').readJSON('sched.json',1)||[];
  var time = new Date();
  var currentTime = (time.getHours()*3600000)+(time.getMinutes()*60000)+(time.getSeconds()*1000);
  var d = time.getDate();
  var active = alarms.filter(a =>
    a.on // enabled
    && (a.last != d) // not already fired today
    && (a.t + 60000 > currentTime) // is not in the past by >1 minute
    && (a.dow >> time.getDay() & 1) // is allowed on this day of the week
    && (!a.date || a.date == time.toLocalISOString().substr(0, 10)) // is allowed on this date
  );
  if (active.length) {
    active = active.sort((a,b)=>a.t-b.t); // sort by time
    var t = active[0].t-currentTime;
    if (t<1000) t=1000; // start alarm minimum 1 sec from now
    /* execute alarm at the correct time. We avoid execing immediately
    since this code will get called AGAIN when alarm.js is loaded. alarm.js
    will then clearInterval() to get rid of this call so it can proceed
    normally.
    If active[0].js is defined, just run that code as-is and not alarm.js */
    Bangle.SCHED = setTimeout(active[0].js||'load("sched.js")',t);
    // Override setTimeZone to ensure we reschedule alarms after it has been called - fix #3791
    var tz = E.setTimeZone;
    E.setTimeZone = function(z) { tz(z);eval(require("Storage").read("sched.boot.js")); };
  } else { // check for new alarms at midnight (so day of week works)
    Bangle.SCHED = setTimeout('eval(require("Storage").read("sched.boot.js"))', 86400000 - currentTime);
  }
})();
/* DEBUGGING
===============

// show the current timer for the next event
global["\xff"].timers[Bangle.SCHED]

// time in hours of scheduled timer event
global["\xff"].timers[Bangle.SCHED].time / (1024*1024*60*60)

// set time 1 hour in the past
setTime(getTime() - 60*60)

*/
