const Storage = require('Storage');
const Sched = require('sched');
const Time_utils = require('time_utils');


// Convenience functions //

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
  // A simple timer object that can be used as a countdown or countup
  // timer. It can be paused and resumed, and it can be reset to its
  // original value. It can also be saved to and loaded from a
  // persistent storage.

  constructor(origin, is_running, rate, name, id) {
    // origin: initial value of the timer
    // is_running: true if the timer should begin running immediately,
    //             false if it should be paused
    // rate: rate of the timer, in units per second. Positive for
    //       countup, negative for countdown
    // name: name of the timer (can be empty)
    // id: ID of the timer

    this.origin = origin || 0;
    // default rate +1 unit per 1000 ms, countup
    this.rate = rate || 0.001;
    this.name = name || '';
    this.id = id || 0;

    this.vibrate_pattern = ';;;';
    this.buzz_count = 4;
    this.chain_id = null;

    this._start_time = Date.now();
    this._pause_time = is_running ? null : this._start_time;
  }

  display_name() {
    // Return a string to display as the timer name
    // If the name is empty, return a generated name
    return this.name ? this.name : this.provisional_name();
  }

  provisional_name() {
    // Return a generated name for the timer based on the timer's
    // origin and current value

    return (
      format_duration_2(this.to_msec(this.origin))
      + ' / '
      + format_duration_2(this.to_msec())
    );
  }

  display_status() {
    // Return a string representing the timer's status
    // (e.g. running, paused, expired)

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
    // Return true if the timer is running, false if it is paused

    return !this._pause_time;
  }

  start() {
    // Start the timer if it is paused

    if (!this.is_running()) {
      this._start_time += Date.now() - this._pause_time;
      this._pause_time = null;
    }
  }

  pause() {
    // Pause the timer if it is running

    if (this.is_running()) {
      this._pause_time = Date.now();
    }
  }

  reset() {
    this.set(this.origin);
  }

  get() {
    // Return the current value of the timer, in rate units

    const now = Date.now();
    const elapsed =
          (now - this._start_time)
          - (this.is_running() ? 0 : (now - this._pause_time));
    return this.origin + (this.rate * elapsed);
  }

  set(new_value) {
    // Set the timer to a new value, in rate units

    const now = Date.now();
    this._start_time = (now - new_value / this.rate)
      + (this.origin / this.rate);
    if (!this.is_running()) {
      this._pause_time = now;
    }
  }

  to_msec(value) {
    // Convert given timer value to milliseconds using this.rate
    // Uses the current value of the timer if no value is provided
    if (value === undefined) {
      value = this.get();
    }
    return Math.ceil(value / Math.abs(this.rate));
  }

  dump() {
    // Serialize the timer object to a JSON-compatible object

    return {
      cls: 'PrimitiveTimer',
      version: 0,
      origin: this.origin,
      rate: this.rate,
      name: this.name,
      id: this.id,
      chain_id: this.chain_id,
      start_time: this._start_time,
      pause_time: this._pause_time,
      vibrate_pattern: this.vibrate_pattern,
      buzz_count: this.buzz_count,
    };
  }

  static load(data) {
    // Deserialize a JSON-compatible object to a PrimitiveTimer
    // object

    if (!(data.cls == 'PrimitiveTimer' && data.version == 0)) {
      console.error('Incompatible data type for loading PrimitiveTimer state');
    }
    let loaded = new this(data.origin, false, data.rate, data.name, data.id);
    loaded.chain_id = data.chain_id;
    loaded._start_time = data.start_time;
    loaded._pause_time = data.pause_time;
    loaded.vibrate_pattern = data.vibrate_pattern;
    loaded.buzz_count = data.buzz_count;
    return loaded;
  }

}


function format_duration(msec, have_seconds) {
  // Format a duration in milliseconds as a string in HH:MM format
  // (have_seconds is false) or HH:MM:SS format (have_seconds is true)

  if (msec < 0) {
    return '-' + format_duration(-msec, have_seconds);
  }
  const time = Time_utils.decodeTime(msec);
  time.h += time.d * 24;
  let str = time.h + ":" + ("0" + time.m).slice(-2);
  if (have_seconds) {
    str += ":" + ("0" + time.s).slice(-2);
  }
  return str;
}


function format_duration_2(msec) {
  // Like `time_utils.formatDuration`, but handles negative durations
  // and returns '0s' instead of an empty string for a duration of zero

  let s = Time_utils.formatDuration(Math.abs(msec))
  if (s === '') {
    return '0s';
  }
  if (msec < 0) {
    return '- ' + s;
  }
  return s;
}


// Persistent state //

const TIMERS_FILENAME = 'tevtimer.timers.json';
const SETTINGS_FILENAME = 'tevtimer.json';

const SCHEDULED_SAVE_TIMEOUT = 15000;

var SAVE_TIMERS_TIMEOUT = null;
var SAVE_SETTINGS_TIMEOUT = null;


function next_id() {
  // Find the next unused ID number for timers
  let max_id = 0;
  for (let timer of TIMERS) {
    if (timer.id > max_id) {
      max_id = timer.id;
    }
  }
  return max_id + 1;
}

function find_timer_by_id(id) {
  // Return index of timer with ID id, or -1 if not found
  for (let idx = 0; idx < TIMERS.length; idx++) {
    if (TIMERS[idx].id == id) {
      return idx;
    }
  }
  return -1;
}

function load_timers() {
  // Load timers from persistent storage
  // If no timers are found, create and return a default timer

  console.log('loading timers');
  let timers = Storage.readJSON(TIMERS_FILENAME, true) || [];
  if (timers.length) {
    // Deserialize timer objects
    timers = timers.map(t => PrimitiveTimer.load(t));
  } else {
    timers = [new PrimitiveTimer(600, false, -0.001, '', 1)];
    timers[0].end_alarm = true;
  }
  return timers;
}

function save_timers() {
  // Save TIMERS to persistent storage

  console.log('saving timers');
  const dumped_timers = TIMERS.map(t => t.dump());
  if (!Storage.writeJSON(TIMERS_FILENAME, dumped_timers)) {
    E.showAlert('Trouble saving timers');
  }
}

function schedule_save_timers() {
  // Schedule a save of the timers to persistent storage
  // after a timeout. This is used to reduce the number of
  // writes to the flash storage when several changes are
  // made in a short time.

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
  // Save SETTINGS to persistent storage

  console.log('saving settings');
  if (!Storage.writeJSON(SETTINGS_FILENAME, SETTINGS)) {
    E.showAlert('Trouble saving settings');
  }
}

function schedule_save_settings() {
  // Schedule a save of the settings to persistent storage
  // after a timeout. This is used to reduce the number of
  // writes to the flash storage when several changes are
  // made in a short time.

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

// List of actions in menu, in order presented
const ACTIONS = [
  'start/stop',
  'reset',
  'timers',
  'edit',
  'edit_start',
  'format',
];

// Map of action IDs to their UI displayed names
const ACTION_NAMES = {
  'start/stop': 'Start/stop',
  'reset': 'Reset',
  'timers': 'Timers',
  'edit': 'Edit timer',
  'edit_start': 'Edit start',
  'format': 'Format',
};

const SETTINGS = Object.assign({
  'format': {
    'row1': 'time hh:mm',
    'row2': 'start hh:mm:ss',
    'row3': 'current hh:mm:ss',
  },
  'button_act': 'start/stop',
  'left_tap_act': 'edit_start',
  'right_tap_act': 'edit_start',
  'confirm_reset': 'auto',
  'confirm_delete': true,
  'alarm_return': false,
  'auto_reset': false,
}, Storage.readJSON(SETTINGS_FILENAME, true) || {});

var TIMERS = load_timers();


// Persistent data convenience functions

function delete_timer(timers, timer) {
  // Find `timer` in array `timers` and remove it.
  // Return the next timer in the list, or the last one if `timer`
  // was the last one in the list.

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
  // Create a independent timer object duplicating `timer`, assign it a
  // new unique ID, and add it to the top of the array `timers`.
  // Return the new timer object.
  // This is used to create a new timer from an existing one.

  // Create a copy of current timer object
  const new_timer = PrimitiveTimer.load(timer.dump());
  // Assign a new ID to the timer
  new_timer.id = next_id();
  // Place it at the top of the list
  timers.unshift(new_timer);
  return new_timer;
}

function set_last_viewed_timer(timer) {
  // Move `timer` to the top of the list of timers, so it will be
  // displayed first when the timer list is shown.

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
  // Mark the timers as modified and schedule a write to
  // persistent storage.

  setTimeout(update_system_alarms, 500);
  schedule_save_timers();
}

function set_settings_dirty() {
  // Mark the settings as modified and schedule a write to
  // persistent storage.

  schedule_save_settings();
}


// Alarm handling //

function delete_system_alarms() {
  // Delete system alarms associated with the tevtimer app (except those
  // that are snoozed, so that they will trigger later)

  var alarms = Sched.getAlarms().filter(a => a.appid == 'tevtimer');
  for (let alarm of alarms) {
    if (alarm.ot === undefined) {
      console.debug('delete_system_alarms: delete sched alarm ' + alarm.id);
      Sched.setAlarm(alarm.id, undefined);
    } else {
      // Avoid deleting timers awaiting snoozing
      console.debug('delete_system_alarms: skipping snoozed alarm ' + alarm.id);
    }
  }
  Sched.reload();
}

function set_system_alarms() {
  // Set system alarms (via `sched` app) for running countdown timers
  // that will expire in the future.

  for (let idx = 0; idx < TIMERS.length; idx++) {
    let timer = TIMERS[idx];
    let time_to_next_alarm = timer.to_msec();
    if (timer.is_running() && time_to_next_alarm > 0) {
      console.debug('set_system_alarms: set sched alarm ' + timer.id
                    + ' (' + time_to_next_alarm + ' ms)');
      Sched.setAlarm(timer.id, {
        appid: 'tevtimer',
        timer: time_to_next_alarm,
        msg: '',
        js: "load('tevtimer.alarm.js');",
        as: true,    // Allow auto-snooze if not immediately dismissed
      });
    }
  }
  Sched.reload();
}

function update_system_alarms() {
  // Refresh system alarms (`sched` app) to reflect changes to timers

  delete_system_alarms();
  set_system_alarms();
}


// Make sure we save timers and settings when switching to another app
// or rebooting
E.on('kill', () => { save_timers(); });
E.on('kill', () => { save_settings(); });


exports = {TIMERS, SETTINGS, ACTIONS, ACTION_NAMES,
           mod, ceil,
           next_id, find_timer_by_id,
           load_timers, save_timers, schedule_save_timers, save_settings, schedule_save_settings,
           PrimitiveTimer,
           format_duration, format_duration_2,
           delete_timer, add_timer, set_last_viewed_timer, set_timers_dirty, set_settings_dirty,
           update_system_alarms};
