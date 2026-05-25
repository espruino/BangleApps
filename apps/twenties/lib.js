{

  exports.getTimeAtNextBuzz = () => {
    const isWorkTime = (d) =>
      d.getDay() % 6 && d.getHours() >= 8 && d.getHours() < 18;
    const isLookAwayTime = (d) =>
      d.getMinutes() % 20 === 0 && d.getSeconds() < 20;
    const NOW = new Date();
    let t = 8 * 3600000;
    if (isWorkTime(NOW)) {
      if (isLookAwayTime(NOW)) {
        t = NOW.getHours() * 3600000 +
          NOW.getMinutes() * 60000 + 20 * 1000;
      } else {
        t = NOW.getHours() * 3600000 +
          (NOW.getMinutes() + (20 - NOW.getMinutes() % 20)) * 60000;
      }
    }
    return t;
  }

  const S = require("sched");

  exports.buzzAndRearm = function () {
    Bangle.buzz();
    let twentiesAlarm = S.getAlarm("twenties");
    twentiesAlarm.t = exports.getTimeAtNextBuzz();
    S.setAlarm("twenties", twentiesAlarm);
    S.setTimer();
  }

  // If twenties is not installed anymore the alarm is deleted (catch block). Otherwise buzz and rearm as usual (try block).
  const JS_BUZZ_REARM_OR_DELETE_ALARM = `{
    try {
      require('twenties').buzzAndRearm();
    } catch(e) {
      S.setAlarm("twenties", undefined);
      S.reload();
    }
  }`

  exports.setup = function (alarms) {
    const TIME_AT_NEXT_BUZZ = exports.getTimeAtNextBuzz()
    alarms.push({
      id: "twenties",
      on: true,
      t: TIME_AT_NEXT_BUZZ,
      dow: 0b0111110,
      hidden: true,
      group: "Hidden",
      js: JS_BUZZ_REARM_OR_DELETE_ALARM
    });
    S.setAlarms(alarms);
    S.reload();
    require("Storage").erase("twenties.boot.js");
  }
}
