{
  // TODO:
  // - Add settings page.
  // - Add setting for active days and hours.
  // - Add setting for buzz strength/pattern.
  // - Add entry in settings to re-run setup.

  const getTimeAtNextBuzz = () => {
    let workStart = new Date();
    let workEnd = new Date();
    workStart.setHours(8, 0, 0, 0);
    workEnd.setHours(18, 0, 20, 0);
    const isWorkTime = (d) => d.getDay() % 6 && d >= workStart && d < workEnd;
    const isLookAwayTime = (d) =>
      d.getMinutes() % 20 === 0 && d.getSeconds() < 20;
    const NOW = new Date();
    let t = workStart.getHours() * 3600000 + workStart.getMinutes() * 60000;
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
  };

  exports.buzzAndSetup = function () {
    Bangle.buzz();
    exports.setup();
  };

  const JS_DELETE_ALARM_THEN_BUZZ_AND_SETUP = `require("sched").setAlarm("twenties", undefined); require('twenties').buzzAndSetup();`;

  const S = require("sched");

  exports.setup = function () {
    const TIME_AT_NEXT_BUZZ = getTimeAtNextBuzz();
    let alarm = {
      on: true,
      t: TIME_AT_NEXT_BUZZ,
      dow: 0b0111110,
      hidden: true,
      msg: "Twenties",
      group: "Twenties",
      js: JS_DELETE_ALARM_THEN_BUZZ_AND_SETUP
    };
    S.setAlarm("twenties", alarm);
    S.reload();
  };
}
