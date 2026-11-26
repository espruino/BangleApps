/* BangTurn widget, installed as "bangturn.wid.js".
   Shows the whole minutes left (rounded down, like the countdown) while a walk runs; width 0 and
   no timers when idle. Hidden (width 0, no timers) inside the BangTurn
   app, which calls WIDGETS.bangturn.hide(). Redraws on "bangturn" events and once a minute,
   aligned to the moment the displayed number changes, so it wakes the CPU
   at most once a minute. A tap on the number opens the app (from a clock or any other app).
   Idle cost: one small Storage read at load.
   See docs/ARCHITECTURE.md. */
(function () {
  var W = 28, to, hidden;
  function active() {
    var s = require("Storage").readJSON("bangturn.json", 1);
    return !!(s && s.start !== undefined);
  }
  function tick() {
    to = undefined;
    var st = require("bangturn").status();
    if (!st.active) return update();
    // time's up but the "end" wake-up hasn't come (sched missed it): end the
    // walk rather than redrawing a 0 every second for ever
    if (st.remaining <= 0) return require("bangturn").finish();
    WIDGETS.bangturn.draw(st);
    /* next change of the minutes, +50 ms margin */
    to = setTimeout(tick, require("bangturn").untilMins(st.remaining) + 50);
  }
  function update() {
    var on = !hidden && active(), w = on ? W : 0, wd = WIDGETS.bangturn;
    if (to) { clearTimeout(to); to = undefined; }
    if (wd.width != w) {
      wd.width = w;
      Bangle.drawWidgets();
    }
    if (on) tick();
  }
  WIDGETS.bangturn = {
    area: "tr",
    sortorder: -1, // after the others in the top right: left of the battery
    width: 0,
    /* the BangTurn app shows the countdown itself, so it hides this */
    hide: function () { hidden = true; update(); },
    draw: function (st) {
      if (!this.width || this.x === undefined) return;
      if (!st || st.remaining === undefined) st = require("bangturn").status();
      if (!st.active) return;
      var m = require("bangturn").mins(st.remaining);
      g.reset().clearRect(this.x, this.y, this.x + W - 1, this.y + 23)
        .setFontAlign(0, 0).setFont("6x8", m > 99 ? 1 : 2)
        .drawString(m, this.x + W / 2, this.y + 12);
    }
  };
  /* A tap on the number opens BangTurn, from a clock or any other app, while
     the number is drawn (walk running, not hidden inside BangTurn itself,
     widget bar showing). The target is the widget's box plus a few pixels to
     the sides, where the neighbours are. On a clock it also reaches down into
     the top of the face, which uses taps there least. In other apps it stays
     inside the widget bar, so taps meant for the app are left alone. Touches
     only register while the watch is unlocked. */
  Bangle.on("touch", function (b, e) {
    var wd = WIDGETS.bangturn;
    if (hidden || !wd.width || wd.x === undefined || !e) return;
    // widget bar hidden (full-screen app, or widget_utils.hide() blanks the area)
    if ((Bangle.appRect && Bangle.appRect.y < 24) || !wd.area || wd._draw) return;
    var bot = wd.y + (Bangle.CLOCK ? 35 : 23);
    if (e.x < wd.x - 4 || e.x > wd.x + W + 3 || e.y < wd.y || e.y > bot) return;
    if (E.stopEventPropagation) E.stopEventPropagation();
    load("bangturn.app.js");
  });
  Bangle.on("bangturn", update);
  update();
})();
