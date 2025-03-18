// load library
let sched = require("sched");

// find next active alarm in range
function getNextAlarm(allAlarms, fo, withId) {
  if (withId) allAlarms = allAlarms.map((a, idx) => {
    a.idx = idx;
    return a;
  });
  // return next active alarms in range, filter for
  //  active && not timer && not own alarm &&
  //  after from && before to && includes msg
  let ret = allAlarms.filter(
      a => a.on && !a.timer && a.id !== "sleeplog" &&
      a.t >= fo.from && a.t < fo.to && (!fo.msg || a.msg.includes(fo.msg))
    ).map(a => { // add time to alarm
      a.tTo = sched.getTimeToAlarm(a);
      return a;
    }).filter(a => a.tTo // filter non active alarms
    // sort to get next alarm first
    ).sort((a, b) => a.tTo - b.tTo);
  // prevent triggering for an already triggered alarm again if available
  if (fo.lastDate) {
    let toLast = fo.lastDate - new Date().valueOf() + 1000;
    if (toLast > 0) ret = ret.filter(a => a.tTo > toLast);
  }
  // return first entry
  return ret[0] || {};
}

exports = {
  // function to read settings with defaults
  getSettings: function() {
    return Object.assign({
      enabled: true,
      earlier: 30,
      fromConsec: false,
      vibrate: "..",
      msg: "...\n",
      msgAsPrefix: true,
      disableOnAlarm: false, // !!! not available if alarm is at the next day
      as: true,
      filter: {
        from: 3 * 36E5,
        to: 12 * 36E5,
        msg: ""
      },
      wid: {
        hide: false,
        time: true,
        color: g.theme.dark ? 65504 : 31 // yellow or blue
      }
    }, require("Storage").readJSON("sleeplogalarm.settings.json", true) || {});
  },

  // widget reload function
  widReload: function() {
    // abort if trigger object is not available
    if (typeof (global.sleeplog || {}).trigger !== "object") return;

    // read settings to calculate alarm range
    let settings = exports.getSettings();

    // set the alarm time
    this.time = getNextAlarm(sched.getAlarms(), settings.filter).t;

    // abort if no alarm time could be found inside range
    if (!this.time) return;

    // set widget width if not hidden
    if (!settings.wid.hide) this.width = 8;

    // insert sleeplogalarm conditions and function
    sleeplog.trigger.sleeplogalarm = {
      from: this.time - settings.earlier * 6E4,
      to: this.time - 1,
      fn: function (data) {
        // execute trigger function if on light sleep or awake
        //  and if set if comming from consecutive
        if ((data.status === 3 || data.status === 2) && !settings.fromConsec ||
            data.consecutive === 3 || data.prevConsecutive === 3)
          require("sleeplogalarm").trigger();
      }
    };
  },

  // trigger function
  trigger: function() {
    // read settings
    let settings = exports.getSettings();

    // read all alarms
    let allAlarms = sched.getAlarms();

    // find first active alarm
    let alarm = getNextAlarm(sched.getAlarms(), settings.filter, settings.disableOnAlarm);

    // return if no alarm is found
    if (!alarm) return;

    // get now
    let now = new Date();

    // get date of the alarm
    let aDate = new Date(now + alarm.tTo);

    // disable earlier triggered alarm if set
    if (settings.disableOnAlarm) {
      // set alarms last to the day it would trigger
      allAlarms[alarm.idx].last = aDate.getDate();
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
      t: ((now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds()) * 1000,
      dow: 127,
      msg: settings.msg + (settings.msgAsPrefix ? alarm.msg || "" : ""),
      vibrate: settings.vibrate || alarm.vibrate,
      as: settings.as,
      del: true
    });

    // save date of the alarm to prevent triggering for the same alarm again
    settings.filter.lastDate = aDate.valueOf();
    require("Storage").writeJSON("sleeplogalarm.settings.json", settings);

    // write changes
    sched.setAlarms(allAlarms);

    // trigger sched.js
    load("sched.js");
  }
};