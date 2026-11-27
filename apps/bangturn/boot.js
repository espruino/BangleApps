/* BangTurn boot code, installed as "bangturn.boot.js". It runs every time
   an app loads, so it is tiny: when no walk is running it reads
   bangturn.json and does nothing else. During a walk it hands over to the
   "bangturn.speed" module, which keeps GPS on and tracks the distance in
   the background, whatever app is open. A walk whose hour ran out while
   the watch was off is finished here. See docs/ARCHITECTURE.md.
   OWNED BY: GPS speed task. */
(function () {
  Bangle.on("bangturn", function (type) {
    require("bangturn.speed").event(type);
  });
  var s = require("Storage").readJSON("bangturn.json", 1);
  if (s && s.start !== undefined) {
    var bt = require("bangturn");
    // The watch was off (or sched missed the end): a walk whose hour is
    // up ends now, silently, rather than showing 0:00:00 for ever.
    if (bt.status(undefined, s).remaining <= 0) bt.finish();
    else {
      bt.catchUp(); // entries missed across midnight while the watch was off
      require("bangturn.speed").resume(s);
    }
  }
})();
