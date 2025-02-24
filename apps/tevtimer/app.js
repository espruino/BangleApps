const Layout = require('Layout');
const locale = require('locale');

const tt = require('tevtimer');


// UI //

// Length of time displaying timer view before moving timer to top of
// timer list
const MOVE_TO_TOP_TIMEOUT = 5000;

// Min number of pixels of movement to recognize a touchscreen drag/swipe
const DRAG_THRESHOLD = 50;

const ROW_IDS = ['row1', 'row2', 'row3'];

const FONT = {
  'row1': {
    'start hh:mm:ss': '12x20',
    'current hh:mm:ss': '12x20',
    'time hh:mm:ss': '12x20',

    'start hh:mm': '12x20',
    'current hh:mm': '12x20',
    'time hh:mm': '12x20',
  },

  'row2': {
    'start hh:mm:ss': 'Vector:34x42',
    'current hh:mm:ss': 'Vector:34x42',
    'time hh:mm:ss': 'Vector:34x42',

    'start hh:mm': 'Vector:56x42',
    'current hh:mm': 'Vector:56x42',
    'time hh:mm': 'Vector:56x42',
  },

  'row3': {
    'start hh:mm:ss': 'Vector:34x56',
    'current hh:mm:ss': 'Vector:34x56',
    'time hh:mm:ss': 'Vector:34x56',

    'start hh:mm': 'Vector:56x56',
    'current hh:mm': 'Vector:56x56',
    'time hh:mm': 'Vector:56x56',
  }
};


function row_font(row_name, mode_name) {
  font = FONT[row_name][mode_name];
  if (font === undefined) {
    console.error('Unknown font for row_font("' + row_name + '", "' + mode_name + '")');
    return '12x20';
  }
  return font;
}


class TimerView {
  constructor(timer) {
    this.timer = timer;

    this.layout = null;
    this.listeners = {};
    this.timer_timeout = null;
  }

  start() {
    this._initLayout();
    this.layout.clear();
    this.render();

    // Physical button handler
    this.listeners.button = setWatch(
      this.start_stop_timer.bind(this),
      BTN,
      {edge: 'falling', debounce: 50, repeat: true}
    );

    let distanceX = null;
    function dragHandler(ev) {
      if (ev.b) {
        if (distanceX === null) {
          // Drag started
          distanceX = ev.dx;
        } else {
          // Drag in progress
          distanceX += ev.dx;
        }
      } else {
        // Drag released
        distanceX = null;
      }
      if (Math.abs(distanceX) > DRAG_THRESHOLD) {
        // Horizontal scroll threshold reached
        Bangle.buzz(50, 0.5);
        // Switch UI view to next or previous timer in list based on
        // sign of distanceX
        let new_index = tt.TIMERS.indexOf(this.timer) + Math.sign(distanceX);
        if (new_index < 0) {
          new_index = tt.TIMERS.length - 1;
        } else if (new_index >= tt.TIMERS.length) {
          new_index = 0;
        }
        switch_UI(new TimerView(tt.TIMERS[new_index]));
        distanceX = null;
      }
    }
    this.listeners.drag = dragHandler.bind(this);
    Bangle.on('drag', this.listeners.drag);

    // Auto move-to-top on use handler
    this.listeners.to_top_timeout = setTimeout(
      tt.set_last_viewed_timer, MOVE_TO_TOP_TIMEOUT, this.timer);
  }

  stop() {
    if (this.timer_timeout !== null) {
      clearTimeout(this.timer_timeout);
      this.timer_timeout = null;
    }
    clearWatch(this.listeners.button);
    Bangle.removeListener('drag', this.listeners.drag);
    clearTimeout(this.listeners.to_top_timeout);
    Bangle.setUI();
  }

  _initLayout() {
    const layout = new Layout(
      {
        type: 'v',
        bgCol: g.theme.bg,
        c: [
          {
            type: 'txt',
            id: 'row1',
            label: '88:88:88',
            font: row_font('row1', tt.SETTINGS.view_mode['row1']),
            fillx: 1,
          },
          {
            type: 'txt',
            id: 'row2',
            label: '88:88:88',
            font: row_font('row2', tt.SETTINGS.view_mode['row2']),
            fillx: 1,
          },
          {
            type: 'txt',
            id: 'row3',
            label: '',
            font: row_font('row3', tt.SETTINGS.view_mode['row3']),
            fillx: 1,
          },
          {
            type: 'h',
            id: 'buttons',
            c: [
              {type: 'btn', font: '6x8:2', fillx: 1, label: 'St/Pa', id: 'start_btn',
               cb: this.start_stop_timer.bind(this)},
              {type: 'btn', font: '6x8:2', fillx: 1, label: 'Menu', id: 'menu_btn',
               cb: () => {
                 switch_UI(new TimerViewMenu(this.timer));
               }
              }
            ]
          }
        ]
      }
    );
    this.layout = layout;
  }

  render(item) {
    console.debug('render called: ' + item);

    if (!item) {
      this.layout.update();
    }

    if (!item || item == 'timer') {

      this._update_fonts();

      let update_interval = Infinity;

      for (var id of ROW_IDS) {
        const elem = this.layout[id];
        let mode = tt.SETTINGS.view_mode[id];
        if (mode == 'start hh:mm:ss') {
          elem.label = tt.format_duration(this.timer.origin / Math.abs(this.timer.rate), true);
          update_interval = Math.min(update_interval, 1);
        } else if (mode == 'current hh:mm:ss') {
          elem.label = tt.format_duration(this.timer.get() / Math.abs(this.timer.rate), true);
          update_interval = Math.min(update_interval, 1);
        } else if (mode == 'time hh:mm:ss') {
          elem.label = locale.time(new Date()).trim();
          update_interval = Math.min(update_interval, 1);

        } else if (mode == 'start hh:mm') {
          elem.label = tt.format_duration(this.timer.origin / Math.abs(this.timer.rate), false);
          update_interval = Math.min(update_interval, 60);
        } else if (mode == 'current hh:mm') {
          elem.label = tt.format_duration(this.timer.get() / Math.abs(this.timer.rate), false);
          update_interval = Math.min(update_interval, 60);
        } else if (mode == 'time hh:mm') {
          elem.label = locale.time(new Date(), 1).trim();
          update_interval = Math.min(update_interval, 60);

        } else if (mode == 'name') {
          elem.label = this.timer.display_name();
        }
        this.layout.clear(elem);
        this.layout.render(elem);
      }

      if (this.timer.is_running()) {
        if (this.timer_timeout) {
          clearTimeout(this.timer_timeout);
          this.timer_timeout = null;
        }

        // Set up timeout to render timer again when needed
        if (update_interval !== Infinity) {

          // Calculate approximate time next render is needed.
          let next_update = this.timer.get() % update_interval;
          if (next_update < 0) {
            next_update = 1 + next_update;
          }
          // Convert next_update from seconds to milliseconds and add
          // compensating factor of 50ms due to timeouts apparently
          // sometimes triggering too early.
          next_update = next_update / Math.abs(this.timer.rate) + 50;
          console.debug('Next render update scheduled in ' + next_update);
          this.timer_timeout = setTimeout(
            () => { this.timer_timeout = null; this.render('timer'); },
            next_update
          );
        }
      }
    }

    if (!item || item == 'status') {
      this.layout.start_btn.label =
        this.timer.is_running() ? 'Pause' : 'Start';
      this.layout.render(this.layout.buttons);
    }
  }

  _update_fonts() {
    for (var id of ROW_IDS) {
      const elem = this.layout[id];
      elem.font = row_font(id, tt.SETTINGS.view_mode[id]);
      this.layout.clear(elem);
      this.layout.render(elem);
    }
  }

  start_stop_timer() {
    if (this.timer.is_running()) {
      this.timer.pause();
    } else {
      this.timer.start();
    }
    tt.set_timers_dirty();
    this.render('status');
    this.render('timer');
  }
}


class TimerViewMenu {
  constructor(timer) {
    this.timer = timer;
  }

  start() {
    this.top_menu();
  }

  stop() {
    E.showMenu();
  }

  back() {
    switch_UI(new TimerView(this.timer));
  }

  top_menu() {
    const top_menu = {
      '': {
        title: this.timer.display_name(),
        back: this.back.bind(this)
      },
      'Reset': () => { E.showMenu(reset_menu); },
      'Timers': () => {
        switch_UI(new TimerMenu(tt.TIMERS, this.timer));
      },
      'Edit': this.edit_menu.bind(this),
      'Add': () => {
        tt.set_timers_dirty();
        const new_timer = tt.add_timer(tt.TIMERS, this.timer);
        const timer_view_menu = new TimerViewMenu(new_timer);
        timer_view_menu.edit_menu();
      },
      'Delete': () => { E.showMenu(delete_menu); },
    };
    if (tt.TIMERS.length <= 1) {
      // Prevent user deleting last timer
      delete top_menu.Delete;
    }

    const reset_menu = {
      '': {
        title: 'Confirm reset',
        back: () => { E.showMenu(top_menu); }
      },
      'Reset': () => {
        this.timer.reset();
        tt.set_timers_dirty();
        this.back();
      },
      'Cancel': () => { E.showMenu(top_menu); },
    };

    const delete_menu = {
      '': {
        title: 'Confirm delete',
        back: () => { E.showMenu(top_menu); }
      },
      'Delete': () => {
        tt.set_timers_dirty();
        switch_UI(new TimerView(tt.delete_timer(tt.TIMERS, this.timer)));
      },
      'Cancel': () => { E.showMenu(top_menu); },
    };

    E.showMenu(top_menu);
  }

  edit_menu() {
    const edit_menu = {
      '': {
        title: 'Edit: ' + this.timer.display_name(),
        back: () => { this.top_menu(); },
      },
      'Start': this.edit_start_hms_menu.bind(this),
      'Vibrate pattern': require("buzz_menu").pattern(
        this.timer.vibrate_pattern,
        v => this.timer.vibrate_pattern = v),
      'Buzz count': {
        value: this.timer.buzz_count,
        min: 0,
        max: 15,
        step: 1,
        wrap: true,
        format: v => v === 0 ? "Forever" : v,
        onchange: v => {
          this.timer.buzz_count = v;
          tt.set_timers_dirty();
        },
      },
    };

    E.showMenu(edit_menu);
  }

  edit_start_hms_menu() {
    let origin_hms = {
      h: Math.floor(this.timer.origin / 3600),
      m: Math.floor(this.timer.origin / 60) % 60,
      s: Math.floor(this.timer.origin % 60),
    };

    const update_origin = () => {
      this.timer.origin = origin_hms.h * 3600
        + origin_hms.m * 60
        + origin_hms.s;
    };

    const edit_start_hms_menu = {
      '': {
        title: 'Start (HMS)',
        back: this.edit_menu.bind(this),
      },
      'Hours': {
        value: origin_hms.h,
        min: 0,
        max: 9999,
        wrap: true,
        onchange: v => {
          origin_hms.h = v;
          update_origin();
          tt.set_timers_dirty();
        }
      },
      'Minutes': {
        value: origin_hms.m,
        min: 0,
        max: 59,
        wrap: true,
        onchange: v => {
          origin_hms.m = v;
          update_origin();
          tt.set_timers_dirty();
        }
      },
      'Seconds': {
        value: origin_hms.s,
        min: 0,
        max: 59,
        wrap: true,
        onchange: v => {
          origin_hms.s = v;
          update_origin();
          tt.set_timers_dirty();
        }
      },
    };

    E.showMenu(edit_start_hms_menu);
  }
}


class TimerMenu {
  constructor(timers, focused_timer) {
    this.timers = timers;
    this.focused_timer = focused_timer;
  }

  start() {
    this.top_menu();
  }

  stop() {
    E.showMenu();
  }

  back() {
    switch_UI(new TimerViewMenu(this.focused_timer));
  }

  top_menu() {
    let menu = {
      '': {
        title: "Timers",
        back: this.back.bind(this)
      }
    };
    this.timers.forEach((timer) => {
      menu[timer.display_status() + ' ' + timer.display_name()] =
        () => { switch_UI(new TimerView(timer)); };
    });
    E.showMenu(menu);
  }
}


function switch_UI(new_UI) {
  if (CURRENT_UI) {
    CURRENT_UI.stop();
  }
  CURRENT_UI = new_UI;
  CURRENT_UI.start();
}


// Load and start up app //

Bangle.loadWidgets();
Bangle.drawWidgets();

var CURRENT_UI = null;

tt.update_system_alarms();

switch_UI(new TimerView(tt.TIMERS[0]));
