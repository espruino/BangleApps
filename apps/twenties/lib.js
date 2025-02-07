{ // this code is called from `twenties.boot.js` in a scope where the `alarms` variable is defined.

  exports.getTimeAtNextBuzz = () => {
    const isWorkTime = (d) =>
      d.getDay() % 6 && d.getHours() >= 8 && d.getHours() < 18;
    const NOW = new Date();
    let timeAtNextBuzz = 8 * 3600000;
    if (isWorkTime(NOW)) {
      timeAtNextBuzz = NOW.getHours() * 3600000 +
        (NOW.getMinutes() + (20 - NOW.getMinutes() % 20)) * 60000;
    }
    return timeAtNextBuzz;
  }

  const S = require("sched");

  exports.buzzRearmOrDeleteAlarm = function () {
    try { // Verify that twenties is still installed. If not delete its alarm.
      require("twenties");
    } catch (e) {
      S.setAlarm("twenties", undefined);
      S.reload();
      return
    }
    Bangle.buzz()
    let twentiesAlarm = S.getAlarm("twenties");
    twentiesAlarm.t = exports.getTimeAtNextBuzz();
    S.setAlarm("twenties", twentiesAlarm);
  }

  exports.setup = function (alarms) {
    const TIME_AT_NEXT_BUZZ = exports.getTimeAtNextBuzz()
    alarms.push({
      id: "twenties",
      on: true,
      t: TIME_AT_NEXT_BUZZ,
      dow: 0b0111110,
      hidden: true,
      js: "require('twenties').buzzRearmOrDeleteAlarm()"
    });
    S.setAlarms(alarms);
    S.reload();
    require("Storage").erase("twenties.boot.js");
  }
}
