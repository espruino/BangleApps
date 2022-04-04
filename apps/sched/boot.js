// check for alarms
(function() {
  if (Bangle.ALARM) {
    clearTimeout(Bangle.ALARM);
    delete Bangle.ALARM;
  }
  var alarms = require('Storage').readJSON('sched.json',1)||[];
  var time = new Date();
  var active = alarms.filter(a=>a.on && (a.dow>>time.getDay())&1 && (!a.date || a.date==time.toISOString().substr(0,10)));
  if (active.length) {
    active = active.sort((a,b)=>(a.t-b.t)+(a.last-b.last)*86400000);
    var currentTime = (time.getHours()*3600000)+(time.getMinutes()*60000)+(time.getSeconds()*1000);
    var t = active[0].t-currentTime;
    if (active[0].last == time.getDate() || t < -60000) t += 86400000;
    if (t<1000) t=1000; // start alarm min 1 sec from now
    /* execute alarm at the correct time. We avoid execing immediately
    since this code will get called AGAIN when alarm.js is loaded. alarm.js
    will then clearInterval() to get rid of this call so it can proceed
    normally.
    If active[0].js is defined, just run that code as-is and not alarm.js */
    Bangle.ALARM = setTimeout(active[0].js||'load("sched.js")',t);
  } else { // check for new alarms at midnight (so day of week works)
    Bangle.ALARM = setTimeout(() => {
      eval(require("Storage").read("sched.boot.js"));
    }, 86400000 - (Date.now()%86400000));
  }
})();
