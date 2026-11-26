/* BangTurn alerts module, installed to Storage as "bangturn.alerts".
   Spec: docs/spec.md, "Alerts". Interface: docs/ARCHITECTURE.md.

   Every alert calls Bangle.buzz directly and never checks the Quiet Mode
   setting, so they all buzz in Quiet Mode (the Quiet Mode check lives in
   apps and the "buzz" module, not in Bangle.buzz). Strength is always 1
   (full). */

/* Timings in ms, exported so tests can read them */
var T = exports.T = {
  start: 100,      // start confirmation
  short: 200,      // countdown buzz on
  gap: 300,        // countdown buzz off
  long: 600,       // turnaround buzz on
  longGap: 200,    // turnaround buzz off
  turnMax: 6000    // turnaround alarm stops after this
};

/* One short confirmation buzz when a walk starts. Called by the app. */
exports.started = function () {
  Bangle.buzz(T.start, 1);
};

/* Buzzing shakes the accelerometer, and on a real Bangle.js 2 that can
   read as a twist or a tap: the firmware's twist and tap detection don't
   know the motor is running. So a buzz may unlock the watch and light it
   for a moment, as the user's own twist or tap would; it locks again on
   its normal timeout. The countdown just buzzes and leaves that alone
   (Chris, 2026-11-25: no workarounds; an earlier re-lock turned the
   display off and left the screen black). The turnaround alarm doesn't
   treat an unlock as "seen it" (only a button press or a tap stops it). */

/* Walk-back countdown: n short buzzes (1 at 1/2 of the way back, 2 at 1/4,
   3 at 1/8). Runs inside whatever app is open: no drawing, no load(), and
   it doesn't touch the lock, the backlight or the display. */
exports.countdown = function (n) {
  var i = 0;
  (function next() {
    if (i++ >= n) return;
    Bangle.buzz(T.short, 1);
    setTimeout(next, T.short + T.gap);
  })();
};

/* The turnaround alarm currently running, if any (so a second call while
   one is running doesn't stack two alarms). */
var active;

/* Turnaround alarm. Called by the app at startup when
   require("bangturn").takeAlert() returns "turn". Lights the screen, shows
   "TURN AROUND" full screen and repeats long full-strength buzzes until a
   button press, a tap on the screen, or 6 s, whichever comes first. No
   repeats after that. An unlock alone doesn't stop it, since the buzzing
   itself can unlock the watch (a twist or tap read from the vibration).
   The button works locked or not; a tap works once the watch is unlocked.
   Then calls done() once.
   Returns a function that stops the alarm early. */
exports.turnaround = function (done) {
  if (active) active(); // stop (and complete) any alarm already running
  // Each buzz is timed with setTimeout rather than Bangle.buzz's promise, so
  // the pattern is the same everywhere (the emulator resolves it at once).
  var stopped = false, timer, gapTimer, btnWatch;

  function draw() {
    var w = g.getWidth(), h = g.getHeight();
    g.reset().setBgColor(g.theme.bg).clear();
    g.setColor(g.theme.fg).fillRect(0, 0, w - 1, h - 1);
    g.setColor(g.theme.bg).setFontAlign(0, 0).setFont("Vector", 40)
      .drawString("TURN", w / 2, h / 2 - 24)
      .drawString("AROUND", w / 2, h / 2 + 24);
    g.reset();
  }

  // an unlock makes widgets (or the clock) redraw: draw the alarm again
  function onLock() { setTimeout(function () { if (!stopped) draw(); }, 50); }

  function buzz() {
    if (stopped) return;
    Bangle.setLCDPower(1); // keep the screen lit for the whole alarm
    Bangle.buzz(T.long, 1);
    gapTimer = setTimeout(buzz, T.long + T.longGap);
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    if (active === stop) active = undefined;
    if (timer) clearTimeout(timer);
    if (gapTimer) clearTimeout(gapTimer);
    Bangle.removeListener("lock", onLock);
    if (btnWatch) clearWatch(btnWatch);
    try { digitalWrite(VIBRATE, 0); } catch (e) {} // cut a buzz mid-way
    Bangle.setUI();
    g.reset().clear();
    if (global.WIDGETS) Bangle.drawWidgets();
    if (done) done();
  }

  active = stop;
  // setUI drops the app's own handlers while the alarm shows; the button is
  // our own watch (one press, then cleared in stop()).
  Bangle.setUI({ mode: "custom", touch: stop });
  btnWatch = setWatch(stop, BTN1, { edge: "falling", repeat: false });
  Bangle.on("lock", onLock);
  Bangle.setLCDPower(1);
  draw();
  timer = setTimeout(stop, T.turnMax);
  buzz();
  return stop;
};
