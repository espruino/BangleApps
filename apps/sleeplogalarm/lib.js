// load library
var sched = require("sched");

// find next active alarm in range
function getNextAlarm(allAlarms, from, to, withId) {
  if (withId) allAlarms = allAlarms.map((a, idx) => {
    a.idx = idx;
    return a;
  });
  // return next active alarms in range
  return allAlarms.filter(
      a => a.on && !a.timer && a.t >= from && a.t < to
    ).map(a => { // add time to alarm
      a.tTo = sched.getTimeToAlarm(a);
      return a;
    }).filter(a => a.tTo // filter non active alarms 
    // sort to get next alarm first
    ).sort((a, b) => a.tTo - b.tTo)[0] || {};
}

exports = {
  // function to read settings with defaults
  getSettings: function() {
    return Object.assign({
      enabled: true,
      hide: false,
      drawTime: true,
      color: g.theme.dark ? 65504 : 31, // yellow or blue
      from: 4, // 0400
      to: 8, // 0800
      earlier: 30,
      msgAsPrefix: true,
      disableOnAlarm: false, // !!! not available if alarm is at the next day
      msg: "...\n",
      vibrate: "..",
      as: true
    }, require("Storage").readJSON("sleeplogalarm.settings.json", true) || {});
  },

  // widget reload function
  widReload: function() {
    // abort if trigger object is not available
    if (typeof (global.sleeplog || {}).trigger !== "object") return;

    // read settings to calculate alarm range
    var settings = exports.getSettings();

    // set the alarm time
    this.time = getNextAlarm(sched.getAlarms(), settings.from * 36E5, settings.to * 36E5).t;

    // abort if no alarm time could be found inside range
    if (!this.time) return;

    // set widget width if not hidden
    if (!this.hidden) this.width = 8;

    // abort if already alarmed for this alarm
    if ((sleeplog.trigger.sleeplogalarm || {}).last == this.time) return;

    // insert sleeplogalarm conditions and function
    sleeplog.trigger.sleeplogalarm = {
      from: settings.time - settings.earlier * 6E4,
      to: settings.time - 1,
      fn: function (data) {
        // execute trigger function if on light sleep or awake
        if (data.status === 3 || data.status === 2)
          require("sleeplogalarm").trigger();
      }
    };
  },

  // trigger function
  trigger: function(tNow) {
    // read settings
    var settings = exports.getSettings();

    // read all alarms
    var allAlarms = sched.getAlarms();

    // find first active alarm
    var alarm = getNextAlarm(sched.getAlarms(), settings.from * 36E5, settings.to * 36E5, settings.disableOnAlarm);

    // clear sleeplog.trigger object and set alarm time to prevent resetting for this alarm
    sleeplog.trigger.sleeplogalarm = {last: alarm.t};

    // return if no alarm is found
    if (!alarm) return;

    // get now
    var now = new Date();

    // get date of the alarm
    var aDate = new Date(now + alarm.tTo).getDate();

    // disable earlier triggered alarm if set and on the same day
    if (settings.disableOnAlarm && now.getDate() === aDate) {
      // set alarms last to today
      allAlarms[alarm.idx].last = aDate;
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
      t: ((time.getHours() * 60 + time.getMinutes()) * 60 + time.getSeconds()) * 1000,
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
  }
};