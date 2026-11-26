/* BangTurn core module, installed to Storage as "bangturn".
   Usage: var bt = require("bangturn");

   Owns: bangturn.json (walk state) and the "bangturn.*" entries in sched.json.
   Everything else (UI, alerts, GPS, widget) talks to the walk through this
   module and listens for Bangle "bangturn" events. See docs/ARCHITECTURE.md.

   All times are ms since epoch (Date.now()). Functions that take `now` use
   Date.now() when it is left out; the parameter exists for tests. */

var FILE = "bangturn.json";
var APPID = "bangturn";
var MIN = 60000;

/* Walk length. The default is an hour; the user picks their own with the
   duration picker (Settings > Apps > BangTurn, or the button menu on the idle
   screen), saved in bangturn.settings.json as { mins }. Each walk keeps
   the length it was started with (`dur` in bangturn.json), so changing
   the setting during a walk only changes the next walk. */
var SETTINGS = "bangturn.settings.json";
var DEF_MINS = 60;
var MIN_MINS = 1, MAX_MINS = 9 * 60 + 59; // the picker's hours wheel is 0-9
var DURATION = DEF_MINS * MIN;
var TURN = DURATION / 2;

/* Walk-back countdown buzzes, at halving fractions of the way back: half
   of it left, a quarter, an eighth (on an hour walk 15, 7.5 and 3.75 min
   left), with 1, 2 and 3 buzzes. They scale with the walk length, so every
   walk gets all three, after the turnaround. [id, fraction of the way back
   left, buzzes] */
var BACK = [["back2", 1 / 2, 1], ["back4", 1 / 4, 2], ["back8", 1 / 8, 3]];

/* The sched entries for a walk of `dur` ms, as [id, ms after the
   (effective) start]. back2..back8 are the walk-back countdown buzzes. */
function events(dur) {
  var list = [["turn", dur / 2]];
  BACK.forEach(function (b) { list.push([b[0], dur - dur / 2 * b[1]]); });
  list.push(["end", dur]);
  return list;
}
var EVENTS = events(DURATION);
var BUZZES = {};
BACK.forEach(function (b) { BUZZES[b[0]] = b[2]; });

exports.events = events;
exports.SETTINGS = SETTINGS;
exports.MIN_MINS = MIN_MINS;
exports.MAX_MINS = MAX_MINS;

/* The walk length setting, in whole minutes */
exports.getMins = function () {
  var m = (require("Storage").readJSON(SETTINGS, 1) || {}).mins;
  return typeof m == "number" && m >= MIN_MINS && m <= MAX_MINS ? Math.round(m) : DEF_MINS;
};
/* Save the walk length setting (clamped). Applies to the next walk.
   Emits "settings". Returns the minutes saved. */
exports.setMins = function (m) {
  m = isNaN(m) ? DEF_MINS : Math.max(MIN_MINS, Math.min(MAX_MINS, Math.round(m)));
  var o = require("Storage").readJSON(SETTINGS, 1) || {};
  o.mins = m;
  require("Storage").writeJSON(SETTINGS, o);
  emit("settings");
  return m;
};

/* Speed units: "kph" (the default) or "mph", saved in bangturn.settings.json
   as { units }. Speeds are kept in kph everywhere; only what's shown is
   converted (toUnits). Emits "settings" when changed. */
var UNITS = ["kph", "mph"];
var MPH = 1.609344; // km in a mile
exports.UNITS = UNITS;
exports.getUnits = function () {
  var u = (require("Storage").readJSON(SETTINGS, 1) || {}).units;
  return UNITS.indexOf(u) < 0 ? UNITS[0] : u;
};
exports.setUnits = function (u) {
  if (UNITS.indexOf(u) < 0) u = UNITS[0];
  var o = require("Storage").readJSON(SETTINGS, 1) || {};
  o.units = u;
  require("Storage").writeJSON(SETTINGS, o);
  emit("settings");
  return u;
};
/* The GPS log setting: when on, each walk records every GPS fix it gets
   to bangturn.log (see bangturn.speed), for checking the speeds against
   what GPS really sent. Saved in bangturn.settings.json as { log }. Off by
   default. Applies from the next walk. Emits "settings". */
exports.getLog = function () {
  return !!(require("Storage").readJSON(SETTINGS, 1) || {}).log;
};
exports.setLog = function (on) {
  var o = require("Storage").readJSON(SETTINGS, 1) || {};
  o.log = !!on;
  require("Storage").writeJSON(SETTINGS, o);
  emit("settings");
  return o.log;
};
/* The Watch GPS setting: whether BangTurn may use the watch's own GPS chip
   (the big battery drain). Saved in bangturn.settings.json as { wgps:
   false } when not; allowed by default, as before the setting. When not
   allowed, a walk takes GPS only from the phone (Android Integration's
   "Overwrite GPS"), and the chip stays off even when the phone's fixes
   stop (see bangturn.speed). Applies at once, also during a walk. Emits
   "settings". */
exports.getWatchGps = function () {
  return (require("Storage").readJSON(SETTINGS, 1) || {}).wgps !== false;
};
exports.setWatchGps = function (on) {
  var o = require("Storage").readJSON(SETTINGS, 1) || {};
  if (on) delete o.wgps; else o.wgps = false;
  require("Storage").writeJSON(SETTINGS, o);
  emit("settings");
  return !!on;
};
/* A speed in kph, in units `u` (a non-number is passed through) */
exports.toUnits = function (v, u) {
  return u == "mph" && typeof v == "number" ? v / MPH : v;
};

/* Length in ms of the walk with state `s`, or of the next walk when idle.
   A walk saved before lengths were adjustable has no `dur`: an hour. */
exports.duration = function (s) {
  s = s || exports.read();
  if (exports.isActive(s)) return (s.dur || DEF_MINS) * MIN;
  return exports.getMins() * MIN;
};

/* the default walk (an hour) and its turnaround; a walk's own length is
   duration(s) or status().duration */
exports.DURATION = DURATION;
exports.TURN = TURN;
exports.EVENTS = EVENTS;
exports.BUZZES = BUZZES;
exports.FILE = FILE;

function emit(type) {
  Bangle.emit("bangturn", type);
}

/* ---------- state (bangturn.json) ----------
   {} when idle, otherwise:
   { start: ms the walk was started (button press),
     dur: the walk's length in minutes (the setting when it started),
     offset: number of "-1 min" taps (minutes the start was moved earlier),
     turned: true once the turnaround has passed (alarm fired or skipped),
     alert: "turn" while a turnaround alert is waiting to be shown (transient) } */

exports.read = function () {
  return require("Storage").readJSON(FILE, 1) || {};
};

exports.write = function (s) {
  require("Storage").writeJSON(FILE, s);
};

exports.isActive = function (s) {
  s = s || exports.read();
  return s.start !== undefined;
};

/* Effective start: the press time moved earlier by the -1 min taps. */
exports.startTime = function (s) {
  s = s || exports.read();
  return s.start - (s.offset || 0) * MIN;
};

/* Snapshot of the walk for drawing.
   { active, phase: "idle"|"out"|"back", duration, turn, elapsed, remaining,
     toTurn, offset, turned, start }
   duration is the walk's length (the next walk's when idle), turn its half.
   elapsed/remaining/toTurn are ms, clamped to >= 0. */
exports.status = function (now, s) {
  if (now === undefined) now = Date.now();
  s = s || exports.read();
  var dur = exports.duration(s), turn = dur / 2;
  if (!exports.isActive(s))
    return { active: false, phase: "idle", duration: dur, turn: turn, elapsed: 0, remaining: dur, toTurn: turn, offset: 0, turned: false };
  var start = exports.startTime(s);
  var elapsed = Math.max(0, now - start);
  return {
    active: true,
    phase: elapsed < turn ? "out" : "back",
    duration: dur,
    turn: turn,
    start: start,
    elapsed: elapsed,
    remaining: Math.max(0, dur - elapsed),
    toTurn: Math.max(0, turn - elapsed),
    offset: s.offset || 0,
    turned: !!s.turned
  };
};

/* "60:00" style m:ss (whole minutes, no hours) for a duration in ms,
   rounded up to the second, so a countdown shows 60:00 at the start and
   0:00 only at the end. */
exports.fmt = function (ms) {
  var t = Math.ceil(Math.max(0, ms) / 1000);
  return Math.floor(t / 60) + ":" + ("0" + t % 60).substr(-2);
};

/* Whole minutes of the countdown, rounded down: the "47" of "47:30" (the
   minutes fmt() shows), so the widget and the locked app agree. */
exports.mins = function (ms) {
  return Math.floor(Math.ceil(Math.max(0, ms) / 1000) / 60);
};
/* ms until mins(ms) next changes (when fmt() goes from m:00 to m-1:59) */
exports.untilMins = function (ms) {
  return ms - (exports.mins(ms) * 60 - 1) * 1000;
};

/* ---------- sched entries ---------- */

function isOurs(a) {
  return a.appid == APPID || (typeof a.id == "string" && a.id.substr(0, APPID.length + 1) == APPID + ".");
}

/* Our entries currently in sched.json (for tests and debugging). */
exports.getSched = function () {
  return require("sched").getAlarms().filter(isOurs);
};

function writeSched(entries) {
  var sched = require("sched");
  var alarms = sched.getAlarms().filter(function (a) { return !isOurs(a); });
  sched.setAlarms(alarms.concat(entries));
  sched.reload();
}

exports.clearSched = function () {
  writeSched([]);
};

/* Build a sched alarm entry that fires at absolute time `at`. We use plain
   alarms with an explicit date rather than sched timers, so the time is
   absolute and survives reboots and -1 min rescheduling. */
function entry(id, at) {
  var d = new Date(at);
  return {
    id: APPID + "." + id,
    appid: APPID,
    on: true,
    hidden: true, // keep out of the Alarms app list
    del: true,
    t: d.getHours() * 3600000 + d.getMinutes() * 60000 + d.getSeconds() * 1000 + d.getMilliseconds(),
    date: d.toLocalISOString().substr(0, 10),
    dow: 127,
    last: 0,
    js: 'require("bangturn").fire("' + id + '")'
  };
}

/* (Re)write all sched entries from the saved state, skipping any whose time
   has already passed (and the turnaround once it has happened). */
exports.schedule = function (now, s) {
  if (now === undefined) now = Date.now();
  s = s || exports.read();
  if (!exports.isActive(s)) return exports.clearSched();
  var start = exports.startTime(s);
  var list = [];
  events(exports.duration(s)).forEach(function (e) {
    var at = start + e[1];
    if (at <= now) return;
    if (e[0] == "turn" && s.turned) return;
    list.push(entry(e[0], at));
  });
  writeSched(list);
};

/* After a boot: sched only fires entries dated today, so an entry missed
   while the watch was off that is dated yesterday (the watch was off across
   midnight) would never fire, and a missed turnaround would be lost. Such
   entries are moved to now, so sched fires them in a second; fire() then
   handles them as late (the turnaround still shows, a late buzz is
   skipped). Called by the boot code during a walk. */
exports.catchUp = function (now) {
  if (now === undefined) now = Date.now();
  var today = new Date(now).toLocalISOString().substr(0, 10), moved = 0;
  // in walk order, a second apart, so a missed turnaround fires first (and
  // its reschedule then drops the missed buzzes after it)
  var list = exports.getSched().map(function (a) {
    if (!a.date || a.date >= today) return a;
    return entry(a.id.substr(APPID.length + 1), now + 1000 * moved++);
  });
  if (moved) writeSched(list);
};

/* ---------- actions ---------- */

/* Start a walk now (or at time `at`, for tests). Returns the new state.
   Emits "start". */
exports.start = function (at) {
  var now = Date.now();
  if (at === undefined) at = now;
  var s = { start: at, dur: exports.getMins(), offset: 0, turned: false };
  exports.write(s);
  exports.schedule(now, s);
  emit("start");
  return s;
};

/* Cancel the walk: clears all BangTurn sched entries and the state.
   Emits "cancel". */
exports.cancel = function () {
  exports.write({});
  exports.clearSched();
  emit("cancel");
};

/* The walk reached its end (or -1 min pushed the end into the past).
   Silent: clears entries and state, emits "end". */
exports.finish = function () {
  exports.write({});
  exports.clearSched();
  emit("end");
};

/* "-1 min": move the start one minute earlier and reschedule, skipping
   past events. If that puts the turnaround in the past, no alarm fires and
   the walk is marked turned. If it puts the end in the past, the walk
   finishes. Returns the new status. Emits "offset" (or "end"). */
exports.minusOne = function (now) {
  if (now === undefined) now = Date.now();
  var s = exports.read();
  if (!exports.isActive(s)) return exports.status(now, s);
  s.offset = (s.offset || 0) + 1;
  var st = exports.status(now, s);
  if (st.remaining <= 0) {
    exports.finish();
    return exports.status(now, {});
  }
  if (st.phase == "back" && !s.turned) {
    s.turned = true;
    delete s.alert;
  }
  exports.write(s);
  exports.schedule(now, s);
  emit("offset");
  return exports.status(now, s);
};

/* Called by sched (the entries' `js`) when an event is due. Removes the
   fired entry, then:
   - "turn": marks the walk turned, flags the alert and loads the app, which
     shows it via require("bangturn.alerts").turnaround(). Emits "turn".
   - "back2".."back8": require("bangturn.alerts").countdown(n) in place,
     whatever app is open. Emits "buzz". Skipped if over a minute late.
   - "end": finish() (silent). Emits "end". So does any entry that fires
     after the walk's time is up. */
exports.fire = function (id) {
  var s = exports.read();
  // drop this entry (and any other already-past ones) and re-arm sched
  if (!exports.isActive(s)) return exports.clearSched();
  // "end", or any entry that fires once the walk's hour is up (the watch
  // was off or busy past the end): finish silently, no late alarm or buzz
  if (id == "end" || exports.status(undefined, s).remaining <= 0) return exports.finish();
  if (id == "turn") s.turned = true;
  exports.schedule(Date.now() + 1000, s);
  if (id == "turn") {
    s.alert = "turn";
    exports.write(s);
    emit("turn");
    load("bangturn.app.js");
    return;
  }
  if (BUZZES[id] && !late(id, s)) {
    emit("buzz");
    require("bangturn.alerts").countdown(BUZZES[id]);
  }
};

/* A countdown buzz more than LATE after its time (sched catching up after
   the watch was off) would give the wrong count of minutes left, so it is
   skipped. The turnaround alarm still shows when late. */
var LATE = MIN;
function late(id, s) {
  var e = events(exports.duration(s)).filter(function (e) { return e[0] == id; })[0];
  if (!e) return true;
  return Date.now() - (exports.startTime(s) + e[1]) > LATE;
}

/* For the app at startup: returns the pending alert ("turn") and clears it,
   or undefined if there is none. */
exports.takeAlert = function () {
  var s = exports.read();
  var a = s.alert;
  if (a) {
    delete s.alert;
    exports.write(s);
  }
  return a;
};
