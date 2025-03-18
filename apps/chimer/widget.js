(function () {
  // 0: off, 1: buzz, 2: beep, 3: both
  var FILE = "chimer.json";

  var readSettings = () => {
    var settings = require("Storage").readJSON(FILE, 1) || {
      type: 1,
      freq: 0,
      repeat: 1,
      sleep: true,
      start: 6,
      end: 22,
    };
    return settings;
  };

  var settings = readSettings();

  function chime() {
    let count = settings.repeat;

    const chime1 = () => {
      let p;
      if (settings.type === 1) {
        p = Bangle.buzz(100);
      } else if (settings.type === 2) {
        p = Bangle.beep();
      } else {
        return;
      }
      if (--count > 0)
        p.then(() => setTimeout(chime1, 150));
    };

    chime1();
  }

  function queueNextCheckMins(mins) {
    const now = new Date(),
      m = now.getMinutes(),
      s = now.getSeconds(),
      ms = now.getMilliseconds();

    const mLeft = mins - (m + mins * 2) % mins,
      sLeft = mLeft * 60 - s,
      msLeft = sLeft * 1000 - ms;

    setTimeout(check, msLeft);
  }

  let lastHour = new Date().getHours();
  let lastMinute = new Date().getMinutes(); // don't chime when (re)loaded at a whole hour
  function check() {
    const now = new Date(),
      h = now.getHours(),
      m = now.getMinutes();
    if (settings.sleep && (
        h > settings.end ||
        (h >= settings.end && m !== 0) ||
        h < settings.start)
    ) {
      queueNextCheckMins(60);
      return;
    }
    switch (settings.freq) {
      case 1:
        if (m !== lastMinute && m % 30 === 0)
          chime();
        lastHour = h;
        lastMinute = m;
        queueNextCheckMins(30);
        break;
      case 2:
        if (m !== lastMinute && m % 15 === 0)
          chime();
        lastHour = h;
        lastMinute = m;
        queueNextCheckMins(15);
        break;
      case 3:
        // unreachable - not available in settings
        if (m !== lastMinute) chime();
        lastHour = h;
        lastMinute = m;
        queueNextCheckMins(1);
        break;
      default:
        if (h !== lastHour && m === 0) chime();
        lastHour = h;
        queueNextCheckMins(60);
        break;
    }
  }

  check();
})();
