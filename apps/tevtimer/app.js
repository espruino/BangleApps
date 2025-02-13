const Layout = require('Layout');
const locale = require('locale');

const tt = require('tevtimer');


// UI //

ROW_IDS = ['row1', 'row2', 'row3'];

FONT = {
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
  constructor(tri_timer) {
    this.tri_timer = tri_timer;

    this.layout = null;
    this.listeners = {};
    this.timer_timeout = null;
  }

  start() {
    this._initLayout();
    this.layout.clear();
    this.render();
    tt.set_last_viewed_timer(this.tri_timer);
    let render_status = () => { this.render(); };
    this.tri_timer.on('status', render_status);
    this.tri_timer.on('auto-pause', tt.set_timers_dirty);
    this.listeners.status = render_status;

    // Touch handler
    function touchHandler(button, xy) {
      for (var id of ROW_IDS) {
        const elem = this.layout[id];
        if (!xy.type &&
            elem.x <= xy.x && xy.x < elem.x + elem.w &&
            elem.y <= xy.y && xy.y < elem.y + elem.h) {
          Bangle.buzz(50, 0.5);
          tt.SETTINGS.view_mode = (tt.SETTINGS.view_mode + 1) % 4;
          tt.schedule_save_settings();
          setTimeout(this.render.bind(this), 0);
          break;
        }
      }
    }
    this.listeners.touch = touchHandler.bind(this);
    Bangle.on('touch', this.listeners.touch);

    // Physical button handler
    this.listeners.button = setWatch(
      this.start_stop_timer.bind(this),
      BTN,
      {edge: 'falling', debounce: 50, repeat: true}
    );
  }

  stop() {
    if (this.timer_timeout !== null) {
      clearTimeout(this.timer_timeout);
      this.timer_timeout = null;
    }
    this.tri_timer.removeListener('status', this.listeners.status);
    Bangle.removeListener('touch', this.listeners.touch);
    clearWatch(this.listeners.button);
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
                 switch_UI(new TimerViewMenu(this.tri_timer));
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
    this.tri_timer.check_auto_pause();

    if (!item) {
      this.layout.update();
    }

    if (!item || item == 'timer') {

      this._update_fonts();

      for (var id of ROW_IDS) {
        const elem = this.layout[id];
        let mode = tt.SETTINGS.view_mode[id];
        if (mode == 'start hh:mm:ss') {
          elem.label = tt.format_duration(this.tri_timer.origin / Math.abs(this.tri_timer.rate), true);
        } else if (mode == 'current hh:mm:ss') {
          elem.label = tt.format_duration(this.tri_timer.get() / Math.abs(this.tri_timer.rate), true);
        } else if (mode == 'time hh:mm:ss') {
          elem.label = locale.time(new Date()).trim();

        } else if (mode == 'start hh:mm') {
          elem.label = tt.format_duration(this.tri_timer.origin / Math.abs(this.tri_timer.rate), false);
        } else if (mode == 'current hh:mm') {
          elem.label = tt.format_duration(this.tri_timer.get() / Math.abs(this.tri_timer.rate), false);
        } else if (mode == 'time hh:mm') {
          elem.label = locale.time(new Date(), 1).trim();

        } else if (mode == 'name') {
          elem.label = this.tri_timer.display_name();
        }
        this.layout.clear(elem);
        this.layout.render(elem);
      }


      
    }

    if (!item || item == 'status') {
      this.layout.start_btn.label =
        this.tri_timer.is_running() ? 'Pause' : 'Start';
      this.layout.render(this.layout.buttons);

      // this.layout.row3.label =
      //   this.tri_timer.display_status()
      //   + ' ' + this.tri_timer.provisional_name();
      // this.layout.clear(this.layout.row3);
      // this.layout.render(this.layout.row3);
    }

    if (this.tri_timer.is_running() && this.tri_timer.get() > 0) {
      if (this.timer_timeout) {
        clearTimeout(this.timer_timeout);
        this.timer_timeout = null;
      }

      // Calculate approximate time next display update is needed.
      // Usual case: update when numbers change once per second.
      let next_tick = this.tri_timer.get() % 1;
      if (this.tri_timer.rate > 0) {
        next_tick = 1 - next_tick;
      }
      // Convert next_tick from seconds to milliseconds and add
      // compensating factor of 50ms due to timeouts apparently
      // sometimes triggering too early.
      next_tick = next_tick / Math.abs(this.tri_timer.rate) + 50;

      // For slow-update view mode, only update about every 60
      // seconds instead of every second
      if (tt.SETTINGS.view_mode == 3) {
        console.debug(this.tri_timer.time_to_next_event());
        next_tick = this.tri_timer.time_to_next_event() % 60000;
      }

      console.debug('Next render update scheduled in ' + next_tick);
      this.timer_timeout = setTimeout(
        () => { this.timer_timeout = null; this.render('timer'); },
        next_tick
      );
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
    if (this.tri_timer.is_running()) {
      this.tri_timer.pause();
    } else {
      this.tri_timer.start();
    }
    tt.set_timers_dirty();
  }
}


class TimerViewMenu {
  constructor(tri_timer) {
    this.tri_timer = tri_timer;
  }

  start() {
    this.top_menu();
  }

  stop() {
    E.showMenu();
  }

  back() {
    switch_UI(new TimerView(this.tri_timer));
  }

  top_menu() {
    const top_menu = {
      '': {
        title: this.tri_timer.display_name(),
        back: this.back.bind(this)
      },
      'Reset': () => { E.showMenu(reset_menu); },
      'Timers': () => {
        switch_UI(new TimerMenu(tt.TIMERS, this.tri_timer));
      },
      'Edit': this.edit_menu.bind(this),
      'Add': () => {
        tt.set_timers_dirty();
        const new_timer = tt.add_tri_timer(tt.TIMERS, this.tri_timer);
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
        this.tri_timer.reset();
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
        switch_UI(new TimerView(tt.delete_tri_timer(tt.TIMERS, this.tri_timer)));
      },
      'Cancel': () => { E.showMenu(top_menu); },
    };

    E.showMenu(top_menu);
  }

  edit_menu() {
    const edit_menu = {
      '': {
        title: 'Edit: ' + this.tri_timer.display_name(),
        back: () => { this.top_menu(); },
      },
      'Direction': {
        value: this.tri_timer.rate >= 0,
        format: v => (v ? 'Up' : 'Down'),
        onchange: v => {
          this.tri_timer.rate = -this.tri_timer.rate;
          tt.set_timers_dirty();
        }
      },
      'Start (Tri)': this.edit_start_tri_menu.bind(this),
      'Start (HMS)': this.edit_start_hms_menu.bind(this),
      'Increment': {
        value: this.tri_timer.increment,
        min: 1,
        max: 9999,
        step: 1,
        wrap: true,
        onchange: v => {
          this.tri_timer.increment = v;
          tt.set_timers_dirty();
        },
      },
      'Events': this.edit_events_menu.bind(this),
    };

    E.showMenu(edit_menu);
  }

  edit_start_tri_menu() {
    let origin_tri = tt.as_triangle(
      this.tri_timer.origin, this.tri_timer.increment);

    const edit_start_tri_menu = {
      '': {
        title: 'Start (Tri)',
        back: this.edit_menu.bind(this),
      },
      'Outer': {
        value: origin_tri[0],
        min: 0,
        max: Math.floor(9999 / this.tri_timer.increment)
          * this.tri_timer.increment,
        step: this.tri_timer.increment,
        wrap: true,
        noList: true,
        onchange: v => {
          origin_tri[0] = v;
          edit_start_tri_menu.Inner.max = origin_tri[0];
          origin_tri[1] = (this.tri_timer.rate >= 0) ?
            1 : origin_tri[0];
          edit_start_tri_menu.Inner.value = origin_tri[1];
          this.tri_timer.origin = tt.as_linear(
            origin_tri, this.tri_timer.increment
          );
          tt.set_timers_dirty();
        }
      },
      'Inner': {
        value: origin_tri[1],
        min: 0,
        max: origin_tri[0],
        step: 1,
        wrap: true,
        noList: true,
        onchange: v => {
          origin_tri[1] = v;
          this.tri_timer.origin = tt.as_linear(
            origin_tri, this.tri_timer.increment
          );
          tt.set_timers_dirty();
        }
      },
    };

    E.showMenu(edit_start_tri_menu);
  }

  edit_start_hms_menu() {
    let origin_hms = {
      h: Math.floor(this.tri_timer.origin / 3600),
      m: Math.floor(this.tri_timer.origin / 60) % 60,
      s: Math.floor(this.tri_timer.origin % 60),
    };

    const update_origin = () => {
      this.tri_timer.origin = origin_hms.h * 3600
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

  edit_events_menu() {
    const events_menu = {
      '': {
        title: 'Events',
        back: () => { this.edit_menu(); }
      },
      'Outer alarm': {
        value: this.tri_timer.outer_alarm,
        format: v => (v ? 'On' : 'Off'),
        onchange: v => {
          this.tri_timer.outer_alarm = v;
          tt.set_timers_dirty();
        },
      },
      'Outer action': {
        value: tt.ACTIONS.indexOf(this.tri_timer.outer_action),
        min: 0,
        max: tt.ACTIONS.length - 1,
        format: v => tt.ACTIONS[v],
        onchange: v => {
          this.tri_timer.outer_action = tt.ACTIONS[v];
          tt.set_timers_dirty();
        },
      },
      'End alarm': {
        value: this.tri_timer.end_alarm,
        format: v => (v ? 'On' : 'Off'),
        onchange: v => {
          this.tri_timer.end_alarm = v;
          tt.set_timers_dirty();
        },
      },
      'Vibrate pattern': require("buzz_menu").pattern(
        this.tri_timer.vibrate_pattern,
        v => this.tri_timer.vibrate_pattern = v),
      'Buzz count': {
        value: this.tri_timer.buzz_count,
        min: 0,
        max: 15,
        step: 1,
        wrap: true,
        format: v => v === 0 ? "Forever" : v,
        onchange: v => {
          this.tri_timer.buzz_count = v;
          tt.set_timers_dirty();
        },
      },
    };

    E.showMenu(events_menu);
  }
}


class TimerMenu {
  constructor(tri_timers, focused_timer) {
    this.tri_timers = tri_timers;
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
    this.tri_timers.forEach((tri_timer) => {
      menu[tri_timer.display_status() + ' ' + tri_timer.display_name()] =
        () => { switch_UI(new TimerView(tri_timer)); };
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
