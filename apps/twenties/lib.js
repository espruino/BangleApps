{
  const getTimeAtNextBuzz = () => {
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
    setTimeout(() => { // Timeout to try and not interfere with `edgeclk` redrawing the time.
      Bangle.buzz();
      exports.setup();
    }, 10)
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
      group: "Hidden",
      js: JS_DELETE_ALARM_THEN_BUZZ_AND_SETUP
    };
    S.setAlarm("twenties", alarm);
    S.reload();
  };
}
