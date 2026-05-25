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
  };

  exports.buzzAndSetup = function () {
    Bangle.buzz();
    exports.setup();
  };

  const JS_DELETE_ALARM_THEN_BUZZ_AND_SETUP = `require("sched").setAlarm("twenties", undefined); require("sched").reload(); require('twenties').buzzAndSetup();`;

  const S = require("sched");

  exports.setup = function () {
    S.setAlarm("twenties", {
      on: true,
      t: exports.getTimeAtNextBuzz(),
      dow: 0b0111110,
      hidden: true,
      group: "Hidden",
      del: true,
      js: JS_DELETE_ALARM_THEN_BUZZ_AND_SETUP
    });
    S.reload();
  };
}
