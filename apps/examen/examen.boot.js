(function () {
  var storage = require('Storage');
  var SETTINGS_FILE = "examen.json";
  var pending;

  function scheduleNext() {
    if (pending) clearTimeout(pending);
    pending = undefined;

    var settings = storage.readJSON(SETTINGS_FILE, 1) || {};
    var enabled = settings.enabled !== undefined ? settings.enabled : true;
    if (!enabled) return; // reminder off - nothing scheduled, watch sleeps freely

    var hour = settings.hour !== undefined ? settings.hour : 21;
    var minute = settings.minute !== undefined ? settings.minute : 0;

    var now = new Date();
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1); // today's time already passed - aim for tomorrow

    pending = setTimeout(fire, next.getTime() - now.getTime());
  }

  function fire() {
    Bangle.buzz(200);
    setTimeout(function () { Bangle.buzz(200); }, 400);
    setTimeout(function () { Bangle.load("examen.app.js"); }, 900);
  }

  // Exposed so the in-app settings screen can force an immediate reschedule
  // the moment the user changes the time or toggles the reminder, rather
  // than waiting on any kind of polling loop.
  global.examenReschedule = scheduleNext;

  scheduleNext();
})();
