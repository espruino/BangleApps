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
      "pause", "resume",
      "up", "down", "upDown"
    ].includes(k)) throw `Invalid ClockFace option: ${k}`;
  });
  if (!options.draw && !options.update) throw "ClockFace needs at least one of draw() or update() functions";
  this.draw = options.draw || (t=> {
    options.update.apply(this, [t, {d: true, h: true, m: true, s: true}]);
  });
  this.update = options.update || (t => {
    g.clear();
    options.draw.apply(this, [t, {d: true, h: true, m: true, s: true}]);
  });
  if (options.precision===1000||options.precision===60000) throw "ClockFace precision is in seconds, not ms";
  this.precision = (options.precision || 60);
  if (options.init) this.init = options.init;
  if (options.pause) this._pause = options.pause;
  if (options.resume) this._resume = options.resume;
  if ((options.up || options.down) && options.upDown) throw "ClockFace up/down and upDown cannot be used together";
  if (options.up || options.down) this._upDown = (dir) => {
    if (dir<0 && options.up) options.up.apply(this);
    if (dir>0 && options.down) options.down.apply(this);
  };
  if (options.upDown) this._upDown = options.upDown;

  this.is12Hour = !!(require("Storage").readJSON("setting.json", 1) || {})["12hour"];
}

ClockFace.prototype.tick = function() {
  const time = new Date();
  const now = {
    d: `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}`,
    h: time.getHours(),
    m: time.getMinutes(),
    s: time.getSeconds(),
  };
  if (!this._last) {
    g.clear(true);
    Bangle.drawWidgets();
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
  if (this.init) this.init.apply(this);
  if (this._upDown) Bangle.setUI("clockupdown", d=>this._upDown.apply(this,[d]));
  else Bangle.setUI("clock");
  Bangle.loadWidgets();
  delete this._last;
  this.paused = false;
  this.tick();

  Bangle.on("lcdPower", on => {
    if (on) this.resume();
    else this.pause();
  });
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
  this.tick(true);
};

/**
 * Force a complete redraw
 */
ClockFace.prototype.redraw = function() {
  delete this._last;
  this.tick();
};

exports = ClockFace;