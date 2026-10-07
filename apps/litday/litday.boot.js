/* LitDay boot scheduler */
(function () {
  var storage = require('Storage');
  var SETTINGS_FILE = "litday.json";
  var pending;

  function scheduleNext() {
    if (pending) clearTimeout(pending);
    pending = undefined;

    var settings = storage.readJSON(SETTINGS_FILE, 1) || {};
    var enabled = settings.enabled !== undefined ? settings.enabled : true;
    if (!enabled) return;

    var hour = settings.hour !== undefined ? settings.hour : 8;
    var minute = settings.minute !== undefined ? settings.minute : 0;

    var now = new Date();
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1); 

    pending = setTimeout(fire, next.getTime() - now.getTime());
  }

  function fire() {
    Bangle.buzz(200);
    setTimeout(function () { Bangle.buzz(200); }, 400);
    setTimeout(function () { Bangle.load("litday.app.js"); }, 900);
  }

  global.litdayReschedule = scheduleNext;
  scheduleNext();
})();
