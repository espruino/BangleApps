const Storage = require('Storage');
const Sched = require('sched');
const Time_utils = require('time_utils');


// Convenience //

function mod(n, m) {
  // Modulus function that works like Python's % operator
  return ((n % m) + m) % m;
}

function ceil(value) {
  // JavaScript's Math.ceil function is weird, too
  // Attempt to work around it
  return Math.ceil(Math.round(value * 1e10) / 1e10);
}


// Data models //

class PrimitiveTimer {
  constructor(origin, is_running, rate, name) {
    this.origin = origin || 0;
    // default rate +1 unit per 1000 ms, countup
    this.rate = rate || 0.001;
    this.name = name || '';

    this.vibrate_pattern = ';;;';
    this.buzz_count = 4;

    this._start_time = Date.now();
    this._pause_time = is_running ? null : this._start_time;
  }

  display_name() {
    return this.name ? this.name : this.provisional_name();
  }

  provisional_name() {
    return (
      Time_utils.formatDuration(this.origin / Math.abs(this.rate))
      + ' / '
      + Time_utils.formatDuration(Math.abs(this.get() / Math.abs(this.rate)))
    );
  }

  display_status() {
    let status = '';

    // Indicate timer expired if its current value is <= 0 and it's
    // a countdown timer
    if (this.get() <= 0 && this.rate < 0) {
      status += '!';
    }

    if (this.is_running()) {
      status += '>';
    }

    return status;
  }

  is_running() {
    return !this._pause_time;
  }

  start() {
    if (!this.is_running()) {
      this._start_time += Date.now() - this._pause_time;
      this._pause_time = null;
    }
  }

  pause() {
    if (this.is_running()) {
      this._pause_time = Date.now();
    }
  }

  reset() {
    this.set(this.origin);
  }

  get() {
    const now = Date.now();
    const elapsed =
          (now - this._start_time)
          - (this.is_running() ? 0 : (now - this._pause_time));
    return this.origin + (this.rate * elapsed);
  }

  set(new_value) {
    const now = Date.now();
    this._start_time = (now - new_value / this.rate)
      + (this.origin / this.rate);
    if (!this.is_running()) {
      this._pause_time = now;
    }
  }

  // Convert given timer value to milliseconds using this.rate
  // Uses the current value of the timer if no value is provided
  to_msec(value) {
    if (value === undefined) {
      value = this.get();
    }
    return Math.ceil(value / Math.abs(this.rate));
  }

  dump() {
    return {
      cls: 'PrimitiveTimer',
      version: 0,
      origin: this.origin,
      rate: this.rate,
      name: this.name,
      start_time: this._start_time,
      pause_time: this._pause_time,
      vibrate_pattern: this.vibrate_pattern,
      buzz_count: this.buzz_count,
    };
  }

  static load(data) {
    if (!(data.cls == 'PrimitiveTimer' && data.version == 0)) {
      console.error('Incompatible data type for loading PrimitiveTimer state');
    }
    let loaded = new this(data.origin, false, data.rate, data.name);
    loaded._start_time = data.start_time;
    loaded._pause_time = data.pause_time;
    loaded.vibrate_pattern = data.vibrate_pattern;
    loaded.buzz_count = data.buzz_count;
    return loaded;
  }

}


function format_duration(msec, have_seconds) {
  if (msec < 0) {
    return '-' + format_duration(-msec, have_seconds);
  }
  const time = Time_utils.decodeTime(msec);
  time.h += time.d * 24;
  let str = time.h + ":" + ("0" + time.m).substr(-2);
  if (have_seconds) {
    str += ":" + ("0" + time.s).substr(-2);
  }
  return str;
}


// Persistent state //

const TIMERS_FILENAME = 'tevtimer.timers.json';
const SETTINGS_FILENAME = 'tevtimer.json';

const SCHEDULED_SAVE_TIMEOUT = 15000;

var SAVE_TIMERS_TIMEOUT = null;
var SAVE_SETTINGS_TIMEOUT = null;


function load_timers() {
  console.log('loading timers');
  let timers = Storage.readJSON(TIMERS_FILENAME, true) || [];
  if (timers.length) {
    // Deserealize timer objects
    timers = timers.map(t => PrimitiveTimer.load(t));
  } else {
    timers = [new PrimitiveTimer(600, false, -0.001)];
    timers[0].end_alarm = true;
  }
  return timers;
}

function save_timers() {
  console.log('saving timers');
  const dumped_timers = TIMERS.map(t => t.dump());
  if (!Storage.writeJSON(TIMERS_FILENAME, dumped_timers)) {
    E.showAlert('Trouble saving timers');
  }
}

function schedule_save_timers() {
  if (SAVE_TIMERS_TIMEOUT === null) {
    console.log('scheduling timer save');
    SAVE_TIMERS_TIMEOUT = setTimeout(() => {
      save_timers();
      SAVE_TIMERS_TIMEOUT = null;
    }, SCHEDULED_SAVE_TIMEOUT);
  } else {
    console.log('timer save already scheduled');
  }
}

function save_settings() {
  console.log('saving settings');
  if (!Storage.writeJSON(SETTINGS_FILENAME, SETTINGS)) {
    E.showAlert('Trouble saving settings');
  }
}

function schedule_save_settings() {
  if (SAVE_SETTINGS_TIMEOUT === null) {
    console.log('scheduling settings save');
    SAVE_SETTINGS_TIMEOUT = setTimeout(() => {
      save_settings();
      SAVE_SETTINGS_TIMEOUT = null;
    }, SCHEDULED_SAVE_TIMEOUT);
  } else {
    console.log('settings save already scheduled');
  }
}

// Default settings
const SETTINGS = Object.assign({
  'format': {
    'row1': 'time hh:mm',
    'row2': 'start hh:mm:ss',
    'row3': 'current hh:mm:ss',
  },
}, Storage.readJSON(SETTINGS_FILENAME, true) || {});

var TIMERS = load_timers();


// Persistent data convenience functions

function delete_timer(timers, timer) {
  const idx = timers.indexOf(timer);
  if (idx !== -1) {
    timers.splice(idx, 1);
  } else {
    console.warn('delete_timer: Bug? Tried to delete a timer not in list');
  }
  // Return another timer to switch UI to after deleting the focused
  // one
  return timers[Math.min(idx, timers.length - 1)];
}

function add_timer(timers, timer) {
  // Create a copy of current timer object
  const new_timer = PrimitiveTimer.load(timer.dump());
  timers.unshift(new_timer);
  return new_timer;
}

function set_last_viewed_timer(timer) {
  const idx = TIMERS.indexOf(timer);
  if (idx == -1) {
    console.warn('set_last_viewed_timer: Bug? Called with a timer not found in list');
  } else if (idx == 0) {
    console.debug('set_last_viewed_timer: Already set as last timer');
  } else {
    // Move timer to top of list
    TIMERS.splice(idx, 1);
    TIMERS.unshift(timer);
    set_timers_dirty();
  }
}

function set_timers_dirty() {
  setTimeout(update_system_alarms, 500);
  schedule_save_timers();
}

function set_settings_dirty() {
  schedule_save_settings();
}


// Alarm handling //

function delete_system_alarms() {
  var alarms = Sched.getAlarms().filter(a => a.appid == 'tevtimer');
  for (let alarm of alarms) {
    console.debug('delete sched alarm ' + alarm.id);
    Sched.setAlarm(alarm.id, undefined);
  }
  Sched.reload();
}

function set_system_alarms() {
  for (let idx = 0; idx < TIMERS.length; idx++) {
    let timer = TIMERS[idx];
    let time_to_next_alarm = timer.get() / Math.abs(timer.rate);
    if (timer.is_running() && time_to_next_alarm > 0) {
      console.debug('set sched alarm ' + idx + ' (' + time_to_next_alarm + ')');
      Sched.setAlarm(idx.toString(), {
        appid: 'tevtimer',
        timer: time_to_next_alarm,
        msg: '',
        js: "load('tevtimer.alarm.js');",
        data: { idx: idx },
      });
    }
  }
  Sched.reload();
}

function update_system_alarms() {
  delete_system_alarms();
  set_system_alarms();
}


E.on('kill', () => { save_timers(); });
E.on('kill', () => { save_settings(); });


exports = {TIMERS, SETTINGS,
           mod, ceil,
           load_timers, save_timers, schedule_save_timers, save_settings, schedule_save_settings,
           PrimitiveTimer,
           format_duration,
           delete_timer, add_timer, set_last_viewed_timer, set_timers_dirty, set_settings_dirty,
           update_system_alarms};
