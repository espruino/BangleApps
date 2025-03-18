/*
Most of the boilerplate needed to run a clock.
See ClockFace.md for documentation
*/
function ClockFace(options) {
  if ("function"=== typeof options) options = {draw: options}; // simple usage
  // some validation, in the hopes of at least catching typos/basic mistakes
  Object.keys(options).forEach(k => {
    if (![
      "precision",
      "init", "draw", "update",
      "pause", "resume", "remove",
      "up", "down", "upDown",
      "settingsFile",
    ].includes(k)) throw `Invalid ClockFace option: ${k}`;
  });
  if (!options.draw && !options.update) throw "ClockFace needs at least one of draw() or update() functions";
  this.draw = options.draw || (t=> {
    options.update.apply(this, [t, {d: true, h: true, m: true, s: true}]);
  });
  this.update = options.update || (t => {
    g.clearRect(Bangle.appRect);
    options.draw.apply(this, [t, {d: true, h: true, m: true, s: true}]);
  });
  if (options.precision===1000||options.precision===60000) throw "ClockFace precision is in seconds, not ms";
  this.precision = (options.precision || 60);
  if (options.init) this.init = options.init;
  if (options.pause) this._pause = options.pause;
  if (options.resume) this._resume = options.resume;
  if (options.remove) this._remove = options.remove;
  if ((options.up || options.down) && options.upDown) throw "ClockFace up/down and upDown cannot be used together";
  if (options.up || options.down) this._upDown = (dir) => {
    if (dir<0 && options.up) options.up.apply(this);
    if (dir>0 && options.down) options.down.apply(this);
  };
  if (options.upDown) this._upDown = options.upDown;

  if (options.settingsFile) {
    const settings = (require("Storage").readJSON(options.settingsFile, true) || {});
    Object.keys(settings).forEach(k => {
      this[k] = settings[k];
    });
  }
  // showDate defaults to true
  if (this.showDate===undefined) this.showDate = true;
  // if (old) setting was to not load widgets, default to hiding them
  if (this.hideWidgets===undefined && this.loadWidgets===false) this.hideWidgets = 1;

  let s = require("Storage").readJSON("setting.json",1)||{};
  // use global 24/12-hour setting if not set by clock-settings
  if (!('is12Hour' in this)) this.is12Hour = !!(s["12hour"]);
}

ClockFace.prototype.tick = function() {
  "ram"
  if (this._removed) return;
  const time = new Date();
  const now = {
    d: `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}`,
    h: time.getHours(),
    m: time.getMinutes(),
    s: time.getSeconds(),
  };
  if (!this._last) {
    g.clear(true);
    if (global.WIDGETS) Bangle.drawWidgets();
    g.reset();
    this.draw.apply(this, [time, {d: true, h: true, m: true, s: true}]);
  } else {
    let c = {d: false, h: false, m: false, s: false}; // changed
    if (now.d!==this._last.d) c.d = c.h = c.m = c.s = true;
    else if (now.h!==this._last.h) c.h = c.m = c.s = true;
    else if (now.m!==this._last.m) c.m = c.s = true;
    else if (now.s!==this._last.s) c.s = true;
    g.reset();
    this.update.apply(this, [time, c]);
  }
  this._last = now;
  if (this.paused) return; // called redraw() while still paused
  // figure out timeout: if e.g. precision=60s, update at the start of a new minute
  const interval = this.precision*1000;
  this._timeout = setTimeout(() => this.tick(), interval-(Date.now()%interval));
};

ClockFace.prototype.start = function() {
  /* Some widgets want to know if we're in a clock or not (like chrono, widget clock, etc). Normally
  .CLOCK is set by Bangle.setUI('clock') but we want to load widgets so we can check appRect and *then*
  call setUI. see #1864 */
  Bangle.CLOCK = 1;
  Bangle.loadWidgets();
  const widget_util = ["show", "hide", "swipeOn"][this.hideWidgets|0];
  require("widget_utils")[widget_util]();
  if (this.init) this.init.apply(this);
  const uiRemove = this._remove ? () => this.remove() : undefined;
  if (this._upDown) {
    Bangle.setUI({
      mode: "clockupdown",
      remove: uiRemove,
    }, d => this._upDown.apply(this, [d]));
  } else {
    Bangle.setUI({
      mode: "clock",
      remove: uiRemove,
    });
  }
  delete this._last;
  this.paused = false;
  this.tick();

  this._onLcd = on => {
    if (on) this.resume();
    else this.pause();
  };
  Bangle.on("lcdPower", this._onLcd);
};

ClockFace.prototype.pause = function() {
  if (!this._timeout) return; // already paused
  clearTimeout(this._timeout);
  delete this._timeout;
  this.paused = true; // apps might want to check this
  if (this._pause) this._pause.apply(this);
};
ClockFace.prototype.resume = function() {
  if (this._timeout) return; // not paused
  delete this._last;
  this.paused = false;
  if (this._resume) this._resume.apply(this);
  this.tick();
};
ClockFace.prototype.remove = function() {
  this._removed = true;
  require("widget_utils").show();
  if (this._timeout) clearTimeout(this._timeout);
  Bangle.removeListener("lcdPower", this._onLcd);
  if (this._remove) this._remove.apply(this);
};

/**
 * Force a complete redraw
 */
ClockFace.prototype.redraw = function() {
  delete this._last;
  this.tick();
};

exports = ClockFace;
