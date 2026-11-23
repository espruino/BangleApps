/* BangTurn app, installed as "bangturn.app.js".
   OWNED BY: UI task. Screens and menu from docs/spec.md "UI":
   - idle:    60:00 (the walk length), time of day, "Tap to start";
              no swipe for the length (another app on the watch uses swipes).
              The button never starts a walk (it's pressed just to get
              around): it opens the idle menu (Length, the picker); a tap starts
   - running: two lines at the top with the time of day and the walk's
              start time, big m:ss countdown of the whole walk (just the
              minutes, in the same place, while locked), average speed
              rows, each with the time to the origin at that speed, a row
              with the speed needed to be back at 0, the speed now and the
              difference between them
   Swipe right goes back to the clock. The minutes-left widget is hidden.
   - menu:    (idle: Length, Info, Units; the button goes back)
              during a walk: Resume, -1 min (offset shown), Cancel walk,
              Info (GPS via phone/watch, Watch GPS chip on/off, Phone GPS
              setup check, the apps holding GPS, last fix, battery); back to the countdown
              after 10 s with no input
   Keep the startup alert hook at the bottom (see docs/ARCHITECTURE.md). */
var bt = require("bangturn");
var alerts = require("bangturn.alerts");
var speed = require("bangturn.speed");

var MENU_TIMEOUT = 10000;
var screen;      // "main" or "menu"
var drawTimer;   // pending redraw of the main screen
var clockTimer;  // pending redraw of just the time of day
var menuTimer;   // pending return from the menu to the main screen
var closeTimer;  // pending return to the clock after a walk's countdown ended

/* After the countdown reaches 0 with the app open, it goes back to the
   watch's clock this long later (Chris, 2026-11-23), locked or not. Only
   from the idle screen it showed at the end: pressing the button there
   (the idle menu) or tapping to start another walk keeps the app open. */
var CLOSE_AFTER = 8 * 60000;

Bangle.loadWidgets();
// the countdown is on screen, so the minutes-left widget is redundant here
if (WIDGETS.bangturn && WIDGETS.bangturn.hide) WIDGETS.bangturn.hide();

/* Largest Vector font size (<= max) at which `txt` fits in width w */
function fit(txt, max, w) {
  var s = max;
  g.setFont("Vector", s);
  while (s > 10 && g.stringWidth(txt) > w) g.setFont("Vector", --s);
  return s;
}

/* The speed units setting ("kph" or "mph"), read once here and updated by
   the Units menu item, so drawing doesn't read Storage every second */
var units = bt.getUnits();

/* "5.2" (v is in kph: "3.2" with the units set to mph), or "--" before
   there is a speed ("99+" from 100, which is only ever the speed needed in
   the last seconds). The units are drawn after it, small (drawRows). Not
   toFixed(1): Espruino's doesn't carry, so 4.96 would show as 4.9. */
function kph(v) {
  if (typeof v != "number" || !isFinite(v) || v < 0) return "--";
  var n = Math.round(bt.toUnits(v, units) * 10);
  return n >= 1000 ? "99+" : Math.floor(n / 10) + "." + (n % 10);
}

/* The colour of the speed now and of its difference from the speed needed,
   from lines()'s c: green on the speed needed, shading to red as you fall
   BAND (a share of the speed needed: 20%) behind it, and to the normal
   text colour (black on the light theme) as you get BAND ahead. The
   screen has 8 colours, so the shades in between are dithered by the
   firmware. */
var BAND = 0.2;
function nowColour(c) {
  if (c === undefined) return g.theme.fg;
  if (c <= 0) return g.toColor(-c, 1 + c, 0);
  return g.theme.dark ? g.toColor(c, 1, c) : g.toColor(0, 1 - c, 0);
}

/* The speed now less the speed needed (both in kph), as shown: "-0.3" when
   0.3 too slow, "+0.4" when faster than needed, "0.0" on it. From the two
   numbers as rounded on screen (so in the units setting), so the three
   always add up. */
function diff(now, need) {
  var n = Math.round(bt.toUnits(now, units) * 10) - Math.round(bt.toUnits(need, units) * 10), m = Math.abs(n);
  return (n > 0 ? "+" : n < 0 ? "-" : "") + (m >= 1000 ? "99+" : Math.floor(m / 10) + "." + (m % 10));
}

/* Time to walk `km` at speed `v`, as m:ss like the countdown ("--" when
   there is no distance or speed yet, the speed is 0, or it's over 999 min) */
function tto(km, v) {
  if (typeof km != "number" || typeof v != "number" || !(v > 0)) return "--";
  var ms = km * 3600000 / v;
  return ms < 60000000 ? bt.fmt(ms) : "--";
}

/* The Units item of both button menus: a tap switches kph <-> mph and
   redraws the menu (on the same item) */
function unitsItem(menu, again, i) {
  menu["Units: " + units] = function () {
    units = bt.setUnits(units == "kph" ? "mph" : "kph");
    again(i);
  };
}

function pad(n) { return ("0" + n).substr(-2); }
/* "21:14:05" (or "21:14" without seconds) for a Date or ms timestamp */
function hms(t, secs) {
  var d = new Date(t);
  return pad(d.getHours()) + ":" + pad(d.getMinutes()) + (secs ? ":" + pad(d.getSeconds()) : "");
}

/* What the main screen shows, as plain data (also used by the tests).
   now: time of day, with seconds while unlocked. Locked, it's HH:MM and
   dim holds the seconds (":37"), drawn grey after it: locked redraws only
   once a minute, so they are the seconds of the last redraw (the lock, then
   ":00" on each minute) and don't tick. The countdown does the same with
   time and timeDim (the lock, then ":59" as each minute starts).
   start: the walk's start time, moved earlier by any -1 min taps, always with seconds (it's fixed, so
   they never go stale).
   rows: strings when idle. During a walk, objects (drawn in columns):
   - {a:"Out"|"Back", v, tf, t, td}: the half's average speed v, and tf, the
     time to the origin at that speed along the trail home
     (speed.get().home). t is the part of it drawn in the text colour and td
     the part drawn grey: like the countdown, the seconds are grey while
     locked.
   - {a:"Now", v, w, d, c}: v is the speed over the last few seconds, w the
     speed needed (the one that covers the way home in the time left on the
     countdown) and d the difference, v less w, with its sign ("-0.3" is
     0.3 kph too slow; "--" when either is unknown). c is the same
     comparison for the colour of v and d (see nowColour): 0 on the speed needed, down
     to -1 for BAND (20% of the speed needed) or more too slow, up to 1 for
     BAND or more faster than needed; undefined when either is unknown. */
function lines(st, now) {
  if (now === undefined) now = Date.now();
  var locked = Bangle.isLocked();
  // locked redraws once a minute, so the seconds would freeze: they are
  // drawn grey. full is the whole m:ss (for layout), time the black part
  // ("47" of "47:30") and timeDim the grey part (":30")
  var full = bt.fmt(st.remaining), dimTime = st.active && locked;
  var L = { full: full, time: dimTime ? "" + bt.mins(st.remaining) : full, rows: [] };
  L.timeDim = dimTime ? full.substr(full.indexOf(":")) : "";
  L.now = hms(now, !locked);
  L.dim = locked ? hms(now, true).substr(5) : "";
  L.nowFull = hms(now, true); // for layout, so HH:MM doesn't move when locked
  if (st.active) L.start = "Start " + hms(bt.startTime(), true);
  if (!st.active) L.rows.push("Tap to start");
  else {
    var sp = speed.get() || {};
    var row = function (a, v) {
      var tf = tto(sp.home, v);
      var i = locked ? tf.indexOf(":") : -1;
      L.rows.push({ a: a, v: kph(v), tf: tf, t: i < 0 ? tf : tf.substr(0, i), td: i < 0 ? "" : tf.substr(i) });
    };
    row("Out", sp.out);
    if (st.phase == "back") row("Back", sp.back);
    var need = typeof sp.home == "number" && st.remaining > 0 ? sp.home * 3600000 / st.remaining : NaN;
    var r = { a: "Now", v: kph(sp.now), w: kph(need), d: "--" };
    if (r.v != "--" && r.w != "--") {
      r.d = diff(sp.now, need);
      // (never a band under 0.1, the smallest step shown: next to the
      // origin the speed needed is all but 0)
      var n = bt.toUnits(sp.now, units), m = bt.toUnits(need, units);
      r.c = E.clip((n - m) / Math.max(BAND * m, 0.1), -1, 1);
    }
    L.rows.push(r);
  }
  return L;
}

/* Above the countdown: the time of day. During a walk, two lines with
   the times one above the other at the right:
     [GPS symbol]   19:31:38
     Start          18:50:28 */
var TOP = 16; // how much lower the walk screen's countdown and rows are for the second line
function drawClock(L) {
  var R = Bangle.appRect, y = R.y + 12;
  g.reset();
  if (L.start) {
    g.clearRect(R.x, R.y, R.x2, R.y + 39);
    // sized and placed as the full HH:MM:SS, so HH:MM stays put whether
    // the seconds are black or grey; the GPS symbol sits at the left and
    // doesn't move it either
    g.setFont("Vector", 20);
    drawNow(L, R.x2 - 3 - g.stringWidth(L.nowFull), y - 1);
    g.setFontAlign(1, 0).drawString(L.start.substr(6), R.x2 - 3, y + 18);
    g.setFont("Vector", 15).setFontAlign(-1, 0).drawString("Start", R.x + 3, y + 19);
    drawIcon(gpsIcon());
  } else {
    g.clearRect(R.x, y - 11, R.x2, y + 11);
    // sized and placed as the full HH:MM:SS, so HH:MM stays put whether
    // the seconds are black or grey
    fit(L.nowFull, 20, R.w - 4);
    drawNow(L, R.x + (R.w - g.stringWidth(L.nowFull)) / 2, y);
  }
  g.setFontAlign(0, 0);
}
function drawNow(L, x, y) { drawDim(L.now, L.dim, x, y); }
/* s from x in the text colour, then dim (locked seconds) in grey. The 3-bit
   screen dithers grey; a half-and-half #888 loses the small walk-screen
   digits, so it leans towards the text colour. */
function drawDim(s, dim, x, y) {
  g.setFontAlign(-1, 0).drawString(s, x, y);
  if (dim) g.setColor(g.theme.dark ? "#aaa" : "#555").drawString(dim, x + g.stringWidth(s), y).setColor(g.theme.fg);
}

/* The GPS symbol left of the time of day (top row) during a walk: where the
   speeds' GPS comes from, from the same facts as Info.
   "watch": the watch's own GPS chip is on (red: the big battery drain);
   "phone": the phone's fixes are arriving and the chip is off (green phone
     with a location pin);
   "": no GPS yet. Redrawn on its own when it changes (see onGPSIcon). */
var ICON_W = 16;
var drawnIcon; // the symbol on screen now
function gpsIcon(s) {
  s = s || speed.source();
  return s.chip ? "watch" : s.from == "phone" ? "phone" : "";
}
function drawIcon(k) {
  drawnIcon = k;
  var R = Bangle.appRect, cx = R.x + ICON_W / 2, cy = R.y + 12;
  g.reset().clearRect(R.x, cy - 10, R.x + ICON_W, cy + 10);
  if (k == "phone") { // a phone giving its location: a pin on its screen, in green
    g.setColor("#0f0") // pure green: the 3-bit screen dithers darker greens
      .drawRect({ x: cx - 6, y: cy - 10, w: 13, h: 21, r: 2 })
      .drawRect({ x: cx - 5, y: cy - 9, w: 11, h: 19, r: 2 })
      .fillRect(cx - 1, cy + 7, cx + 1, cy + 7) // the button
      .fillCircle(cx, cy - 3, 3) // the pin's head...
      .fillPoly([cx - 3, cy - 2, cx + 3, cy - 2, cx, cy + 4]) // ...and point
      .setColor(g.theme.bg).fillRect(cx, cy - 3, cx, cy - 3); // its hole
  } else if (k == "watch") { // a GPS crosshair, in red
    g.setColor(g.theme.dark ? "#f44" : "#f00")
      .drawCircle(cx, cy, 5).drawCircle(cx, cy, 4).fillCircle(cx, cy, 1)
      .fillRect(cx - 8, cy, cx - 5, cy).fillRect(cx + 5, cy, cx + 8, cy)
      .fillRect(cx, cy - 8, cx, cy - 5).fillRect(cx, cy + 5, cx, cy + 8);
  }
  // back to the theme's colours: draw() goes on to draw the speed rows and
  // the progress bar, which otherwise came out red, or in the background
  // colour (invisible) after the phone's pin hole
  g.reset();
}
/* GPS events already wake the watch (the speed tracker listens), so the
   symbol follows them: redraw it only when it changes. */
function onGPSIcon(f) {
  if (screen != "main" || drawnIcon === undefined) return;
  // from the event itself: the speed tracker may not have seen it yet
  var k = gpsIcon({ chip: Bangle.getGPSFix() !== undefined, from: f.externalSource ? "phone" : "watch" });
  if (k != drawnIcon) drawIcon(k);
}

/* The bottom row: the speed needed after a target symbol, the speed now
   after a speedometer, then the difference, both in the colour that says
   how they compare (see nowColour), with the units ("kph" or "mph") once
   for all three at the end:
     (o) 5.2   (/) 4.9   -0.3 kph
   The difference always has room for a sign, so nothing moves as it
   passes 0.0. All three shrink together when one is long (10 kph or more). */
var GAUGE = atob("DQqBAA+BgxAEgKgMwMYMMEFAEQEA"); // 13x10, 1 bit
function drawGoal(r, y) {
  var R = Bangle.appRect, x1 = R.x + 3, x2 = R.x2 - 3, IW = 16, s = 22;
  var signed = r.d[0] == "-" || r.d[0] == "+", wide = "+" + (signed ? r.d.substr(1) : r.d);
  g.setFont("Vector", 12).setFontAlign(1, 0).drawString(units, x2, y + 2);
  var kw = g.stringWidth(units) + 2, ww, tot;
  do {
    g.setFont("Vector", --s);
    ww = g.stringWidth(r.w);
    tot = 2 * IW + ww + g.stringWidth(r.v) + g.stringWidth(wide) + kw;
  } while (s > 10 && tot > x2 - x1 - 7);
  var x = x1 + 6, gap = (x2 - x1 + 1 - tot) / 2;
  g.drawCircle(x, y, 6).drawCircle(x, y, 3).fillRect(x, y, x, y); // the target
  g.setFontAlign(-1, 0).drawString(r.w, x1 + IW, y);
  x = Math.round(x1 + IW + ww + gap);
  g.drawImage(GAUGE, x, y - 5).setColor(nowColour(r.c)).drawString(r.v, x + IW, y);
  g.setFontAlign(1, 0).drawString(r.d, x2 - kw, y).setColor(g.theme.fg);
}

/* The walk's rows, in columns so the numbers line up and don't move:
     Out   5.2 kph   28:45     label, average speed, time to the origin
     Back  4.9 kph   31:02     (only on the way back, always in this place)
     (o) 5.2  (/) 4.9  -0.3 kph   always the bottom row (see drawGoal)
   Labels and units are small, the numbers big. The units are the Units
   setting's: "mph" in place of "kph". */
function drawRows(rows) {
  var R = Bangle.appRect, y0 = R.y + 77 + TOP, x1 = R.x + 3, x2 = R.x2 - 3;
  var NUM = 22, LBL = 15, SX = R.x + 76; // speeds end at SX
  rows.forEach(function (r) {
    var y = y0 + (r.d ? 2 : r.a == "Back" ? 1 : 0) * 22;
    if (r.d) return drawGoal(r, y);
    g.setFont("Vector", LBL).setFontAlign(-1, 0).drawString(r.a, x1, y + 1);
    g.setFont("Vector", NUM).setFontAlign(1, 0).drawString(r.v, SX, y);
    g.setFont("Vector", 12).setFontAlign(-1, 0).drawString(units, SX + 2, y + 2);
    var kx = SX + 5 + g.stringWidth(units); // where the units end
    // placed as the whole m:ss, so the minutes don't move when the
    // seconds turn grey (smaller only for a time of 100 minutes or more)
    fit(r.tf, NUM, x2 - kx - 1);
    drawDim(r.t, r.td, x2 - g.stringWidth(r.tf), y);
  });
  g.setFontAlign(0, 0);
}

/* Draws the main screen; returns the status it drew */
function draw(st) {
  st = st || bt.status();
  var L = lines(st);
  var R = Bangle.appRect, x = R.x + R.w / 2, w = R.w - 4, y = R.y;
  g.reset().clearRect(R).setFontAlign(0, 0);
  drawnIcon = undefined; // drawn again with the time row during a walk
  // sized and placed as the full m:ss, so the minutes don't move when the
  // seconds turn grey (a line lower during a walk: the start time is above
  // it)
  fit(L.full, 46, w);
  drawDim(L.time, L.timeDim, x - g.stringWidth(L.full) / 2, y + 48 + (st.active ? TOP : 0));
  g.setFontAlign(0, 0);
  drawClock(L);
  if (!st.active) {
    L.rows.forEach(function (r, i) {
      fit(r, 22, w);
      g.drawString(r, x, y + 88 + i * 24);
    });
    return st;
  }
  drawRows(L.rows);
  return st;
}

/* Redraw now, then every second while unlocked, every minute while locked.
   Timed to when the countdown's seconds (or minutes) change, like the
   widget, so no number is skipped or shown twice. Idle: nothing changes,
   so no timer (a "bangturn" event redraws on start).
   The time of day has its own timer on the wall clock's seconds (minutes
   while locked), which only redraws that row. */
function tick() {
  stopTimers();
  if (screen != "main") return;
  // time's up but the "end" wake-up hasn't come (sched missed it): end the
  // walk (its "end" event redraws the idle screen) rather than redrawing
  // 0 every second
  var st = bt.status();
  if (st.active && st.remaining <= 0) return bt.finish();
  draw(st);
  var period = Bangle.isLocked() ? 60000 : 1000;
  clockTimer = setTimeout(clockTick, period - (Date.now() % period) + 20);
  if (!st.active) return;
  drawTimer = setTimeout(tick, (period == 1000 ? st.remaining % 1000 || 1000 : bt.untilMins(st.remaining)) + 20);
}
function clockTick() {
  clockTimer = undefined;
  if (screen != "main") return;
  drawClock(lines(bt.status()));
  var period = Bangle.isLocked() ? 60000 : 1000;
  clockTimer = setTimeout(clockTick, period - (Date.now() % period) + 20);
}
function stopTimers() {
  if (drawTimer) clearTimeout(drawTimer);
  if (clockTimer) clearTimeout(clockTimer);
  drawTimer = clockTimer = undefined;
}

function stopMenuTimer() {
  if (menuTimer) clearTimeout(menuTimer);
  menuTimer = undefined;
}
function startMenuTimer() {
  stopMenuTimer();
  menuTimer = setTimeout(function () { menuTimer = undefined; showMain(); }, MENU_TIMEOUT);
}
/* any touch or swipe in the menu restarts the 10 s timeout */
function onMenuInput() { if (screen == "menu") startMenuTimer(); }

function showMain() {
  stopMenuTimer();
  screen = "main";
  E.showMenu();
  g.reset().clear();
  Bangle.drawWidgets();
  Bangle.setUI({
    mode: "custom",
    // the button never starts a walk (a tap does): it opens a menu, and
    // in the menu it comes back here
    btn: function () { if (bt.isActive()) showWalkMenu(); else { stopClose(); showIdleMenu(); } },
    touch: function () { if (!bt.isActive()) start(); },
    // swipe right: back to the clock (the walk keeps running). No left
    // swipe: another app on the watch uses swipes, so the length is in
    // the button menu
    swipe: function (lr) { if (lr > 0) load(); }
  });
  tick();
}

/* The hours/minutes wheels; the length is saved for the next walk */
function showPicker() {
  stopTimers();
  screen = "picker";
  E.showMenu(); // close the idle menu, if it's open
  require("bangturn.picker").show(bt.getMins(), function (mins) {
    bt.setMins(mins);
    showMain();
  });
}

function start() {
  bt.start();
  alerts.started();
  tick();
}

/* Before a walk: set the length (a tap on the idle screen starts it). Back (or the button) returns
   to the idle screen without starting anything. */
function showIdleMenu(selected) {
  stopTimers();
  screen = "menu";
  var menu = { "": { title: "BangTurn", back: showMain, selected: selected || 0 } };
  menu["Length: " + bt.getMins() + " min"] = function () { stopMenuTimer(); showPicker(); };
  menu["Info"] = function () { showInfo(); };
  unitsItem(menu, showIdleMenu, 2);
  E.showMenu(menu);
  startMenuTimer();
}

function showWalkMenu(selected) {
  stopTimers();
  screen = "menu";
  var off = bt.read().offset || 0;
  var menu = { "": { title: "BangTurn", back: showMain, selected: selected || 0 } };
  menu["Resume"] = showMain;
  menu["-1 min" + (off ? " (-" + off + ")" : "")] = function () {
    bt.minusOne();
    if (bt.isActive()) showWalkMenu(1); else showMain();
  };
  menu["Cancel walk"] = function () { bt.cancel(); showMain(); };
  menu["Info"] = function () { showInfo(); };
  unitsItem(menu, showWalkMenu, 4);
  E.showMenu(menu);
  startMenuTimer();
}

/* "34s ago" / "5m ago" for an age in ms */
function ago(ms) {
  var s = Math.round(ms / 1000);
  return s < 60 ? s + "s ago" : Math.floor(s / 60) + "m ago";
}

/* The apps holding GPS on, from the firmware's own list:
   Bangle.setGPSPower(1, "app") adds "app" to Bangle._PWR.GPS, and GPS stays
   powered while that list isn't empty ("?" is code that didn't give its
   name). Android Integration's Overwrite GPS keeps the same list. */
function gpsApps() {
  var l = Bangle._PWR && Bangle._PWR.GPS;
  return l && l.length ? l.join(", ") : "none";
}

/* Why the phone isn't (or is) supplying GPS, for Info. The phone's GPS
   needs three links, and this names the first one missing:
   - Android Integration's "Overwrite GPS" on: it then defines
     Bangle.moveGPSPower and passes GPS requests to the phone.
   - Bluetooth connected to Gadgetbridge.
   - Gadgetbridge sending fixes: its Bangle.js device setting "Use phone gps
     data" (off by default), and location permission plus "Keep location
     updated" (Gadgetbridge Settings > Location > Acquire location). The
     watch can't read those, so if fixes don't come it says "no fixes".
   "waiting": the phone's fixes have stopped and BangTurn is holding the
   watch's own GPS off for up to a minute, for the phone's next one. */
function phoneGPS(src) {
  if (typeof Bangle.moveGPSPower != "function") return "setting off";
  if (!NRF.getSecurityStatus().connected) return "no Bluetooth";
  if (src.wait) return "waiting";
  if (src.from == "phone") return "working";
  return bt.isActive() ? "no fixes" : "no walk"; // only asked for during a walk
}

/* Info (from the walk menu, or the start screen's menu): where the speeds'
   GPS comes from, whether the watch's own GPS chip (the big battery drain)
   is on, which apps have asked for GPS, how old the last fix is, and the
   battery. Tap a row to refresh; back returns to the menu it came from. */
function showInfo(selected) {
  stopTimers();
  screen = "menu"; // same 10 s timeout, and closes if the walk ends
  var src = speed.source();
  var menu = { "": { title: "Info", selected: selected || 0, back: function () {
    if (bt.isActive()) showWalkMenu(3); else showIdleMenu(1);
  } } };
  var n = 0;
  function row(name, value) {
    var i = n++;
    menu[name] = { value: value, onchange: function () { showInfo(i); } };
  }
  row("GPS via", src.from || "none yet");
  row("Watch GPS", src.chip ? "ON" : "off");
  row("Phone GPS", phoneGPS(src));
  row("GPS apps", gpsApps());
  row("Last fix", src.fixAge === null ? "none" : ago(src.fixAge));
  row("Battery", E.getBattery() + "%");
  E.showMenu(menu);
  startMenuTimer();
}

function stopClose() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = undefined;
}
function armClose() {
  stopClose();
  closeTimer = setTimeout(function () {
    closeTimer = undefined;
    if (screen == "main" && !bt.isActive()) load();
  }, CLOSE_AFTER);
}

function onEvent(type) {
  if (type == "end") armClose();
  else if (type == "start" || type == "cancel") stopClose();
  if (screen == "main") tick();
  else if (screen == "menu" && (type == "end" || type == "cancel")) showMain();
}
function onLock() { if (screen == "main") tick(); }

Bangle.on("bangturn", onEvent);
Bangle.on("lock", onLock);
Bangle.on("GPS", onGPSIcon);
Bangle.on("touch", onMenuInput);
Bangle.on("drag", onMenuInput);
Bangle.drawWidgets();

// Startup alert hook: a sched entry loads this app to show the turnaround.
if (bt.takeAlert() == "turn") alerts.turnaround(showMain);
else showMain();
