exports = function(now, tNow) {
  // define settings
  var settings = Object.assign({
    from: 4, // 0400
    to: 8, // 0800
    earlier: 30,
    msgAsPrefix: true,
    disableOnAlarm: false, // !!! not available if alarm is at the next day
    msg: "...\n",
    vibrate: "..",
    as: true
  }, require("Storage").readJSON("sleeplogalarm.settings.json", true) || {});

  // calculate then date
  var then = new Date(now + settings.earlier * 6E4);

  // load library
  var sched = require("sched");

  // define function to return first active alarm in range to come
  function firstActiveAlarm(allAlarms) {
    return (sched.getActiveAlarms(allAlarms.filter(
      // filter for active alarms, ...
      a => a.on && !a.timer &&
      // after now+10s and in alarm range
      a.t > tNow && a.t >= settings.from * 36E5 && a.t < settings.to * 36E5
    ), then) || []).sort((a, b) => a.t > b.t)[0];
  }

  // read all alarms
  var allAlarms = sched.getAlarms();

  // find first active alarm
  var alarm = firstActiveAlarm(allAlarms);

  // return if no alarm is found
  if (!alarm) return;

  // disable early triggered alarm if set and now and then on the same day
  if (settings.disableOnAlarm && now.getDate() === then.getDate()) {
    // add indexes to find alarm to temporary disable
    allAlarms = allAlarms.map((a, idx) => {
      a.idx = idx;
      return a;
    });
    // get index of first active alarm
    var idx = firstActiveAlarm(allAlarms).idx;
    // set this alarms last to then
    allAlarms[idx].last = then.getDate();
    // remove added indexes
    allAlarms = allAlarms.map(a => {
      delete a.idx;
      return a;
    });
  }

  // add new alarm for now with data from found alarm
  allAlarms.push({
    id: "sleeplog",
    appid: "sleeplog",
    on: true,
    t: (((now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds()) * 1000),
    dow: 127,
    msg: settings.msg + (settings.msgAsPrefix ? alarm.msg || "" : ""),
    vibrate: settings.vibrate || alarm.vibrate,
    as: settings.as,
    del: true
  });

  // write changes
  sched.setAlarms(allAlarms);

  // trigger sched.js
  load("sched.js");
};