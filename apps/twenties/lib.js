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
    print(t);
    return t;
  };

  exports.buzzAndSetup = function () {
    Bangle.buzz();
    exports.setup();
  };

  const JS_DELETE_ALARM_THEN_BUZZ_AND_SETUP = `require("sched").setAlarm("twenties", undefined); require('twenties').buzzAndSetup();`;

  const S = require("sched");

  exports.setup = function () {
    const TIME_AT_NEXT_BUZZ = exports.getTimeAtNextBuzz();
    const TIME_AT_SETUP = new Date();
    let alarm = {
      on: true,
      t: TIME_AT_NEXT_BUZZ,
      dow: 0b0111110,
      hidden: true,
      group: "Hidden",
      js: JS_DELETE_ALARM_THEN_BUZZ_AND_SETUP
    };
    if ( TIME_AT_NEXT_BUZZ <
      TIME_AT_SETUP.getHours() * 3600000 +
      TIME_AT_SETUP.getMinutes() * 60000 +
      TIME_AT_SETUP.getSeconds() * 1000 ) { // FIXME: this is done to work around a behavior in sched library. I think that is maybe a :BUG: that we should fix there. But unsure. It's around https://github.com/espruino/BangleApps/blob/master/apps/sched/boot.js#L21-L21
      alarm.last = Date().getDate();
    }
    S.setAlarm("twenties", alarm);
    S.reload();
  };
}
