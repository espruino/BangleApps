const Layout = require('Layout');
const locale = require('locale');

const tt = require('tevtimer');


// UI //

// Length of time displaying timer view before moving timer to top of
// timer list
const MOVE_TO_TOP_TIMEOUT = 5000;

// Min number of pixels of movement to recognize a touchscreen drag/swipe
const DRAG_THRESHOLD = 50;

const ARROW_BTN_SIZE = 15;

const ROW_IDS = ['row1', 'row2', 'row3'];

const FONT = {
  'row1': {
    'start hh:mm:ss': '12x20',
    'current hh:mm:ss': '12x20',
    'time hh:mm:ss': '12x20',

    'start hh:mm': '12x20',
    'current hh:mm': '12x20',
    'time hh:mm': '12x20',

    'name': '12x20',

    'mode': '12x20',
  },

  'row2': {
    'start hh:mm:ss': 'Vector:34x42',
    'current hh:mm:ss': 'Vector:34x42',
    'time hh:mm:ss': 'Vector:24x42',

    'start hh:mm': 'Vector:48x42',
    'current hh:mm': 'Vector:48x42',
    'time hh:mm': 'Vector:56x42',

    'name': 'Vector:24x42',

    'mode': 'Vector:26x42',
  },

  'row3': {
    'start hh:mm:ss': 'Vector:34x56',
    'current hh:mm:ss': 'Vector:34x56',
    'time hh:mm:ss': 'Vector:24x56',

    'start hh:mm': 'Vector:48x56',
    'current hh:mm': 'Vector:48x56',
    'time hh:mm': 'Vector:56x56',

    'name': 'Vector:24x56',

    'mode': 'Vector:26x56',
  }
};

const FORMAT_MENU = [
  'start hh:mm:ss',
  'start hh:mm',
  'current hh:mm:ss',
  'current hh:mm',
  'time hh:mm:ss',
  'time hh:mm',
  'name',
];

const FORMAT_DISPLAY = {
  'start hh:mm:ss': 'Start HMS',
  'start hh:mm': 'Start HM',
  'current hh:mm:ss': 'Curr HMS',
  'current hh:mm': 'Curr HM',
  'time hh:mm:ss': 'Time HMS',
  'time hh:mm': 'Time HM',
  'name': 'Name',
};


function row_font(row_name, mode_name) {
  let font = FONT[row_name][mode_name];
  if (font === undefined) {
    console.error('Unknown font for row_font("' + row_name + '", "' + mode_name + '")');
    return '12x20';
  }
  return font;
}


// Determine time in milliseconds until next display update for a timer
// that should be updated every `interval` milliseconds.
function next_time_update(interval, curr_time, direction) {
  if (interval <= 0) {
    // Don't update if interval is zero or negative
    return Infinity;
  }

  // Find the next time we should update the display
  let next_update = tt.mod(curr_time, interval);
  if (direction < 0) {
    next_update = 1 - next_update;
  }
  if (next_update < 0) {
    // Handle negative modulus
    next_update += interval;
  }
  next_update = interval - next_update;

  // Add compensating factor of 50ms due to timeouts apparently
  // sometimes triggering too early.
  return next_update + 50;
}


class TimerView {
  constructor(timer) {
    this.timer = timer;

    this.layout = null;
    this.listeners = {};
    this.listeners.timer_render_timeout = null;
  }

  start() {
    this._initLayout();
    this.layout.update();
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
        switch_UI(new TimerView(tt.TIMERS[
          tt.mod(new_index, tt.TIMERS.length)
        ]));
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
    if (this.listeners.timer_render_timeout !== null) {
      clearTimeout(this.listeners.timer_render_timeout);
      this.listeners.timer_render_timeout = null;
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
            label: '',
            font: row_font('row1', tt.SETTINGS.format.row1),
            fillx: 1,
          },
          {
            type: 'txt',
            id: 'row2',
            label: '',
            font: row_font('row2', tt.SETTINGS.format.row2),
            fillx: 1,
          },
          {
            type: 'txt',
            id: 'row3',
            label: '',
            font: row_font('row3', tt.SETTINGS.format.row3),
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
        const running = this.timer.is_running();
        let mode = tt.SETTINGS.format[id];
        if (mode == 'start hh:mm:ss') {
          elem.label = tt.format_duration(this.timer.to_msec(this.timer.origin), true);
        } else if (mode == 'current hh:mm:ss') {
          elem.label = tt.format_duration(this.timer.to_msec(), true);
          if (running) {
            update_interval = Math.min(
              update_interval, 
              next_time_update(1000, this.timer.to_msec(), this.timer.rate)
            );
          }
        } else if (mode == 'time hh:mm:ss') {
          elem.label = locale.time(new Date()).trim();
          update_interval = Math.min(
            update_interval, 
            next_time_update(1000, Date.now(), 1)
          );

        } else if (mode == 'start hh:mm') {
          elem.label = tt.format_duration(this.timer.to_msec(this.timer.origin), false);
        } else if (mode == 'current hh:mm') {
          elem.label = tt.format_duration(this.timer.to_msec(), false);
          if (running) {
            // Update every minute for current HM when running
            update_interval = Math.min(
              update_interval,
              next_time_update(60000, this.timer.to_msec(), this.timer.rate)
            );
          }
        } else if (mode == 'time hh:mm') {
          elem.label = locale.time(new Date(), 1).trim();
          update_interval = Math.min(
            update_interval,
            next_time_update(60000, Date.now(), 1)
          );
        } else if (mode == 'name') {
          elem.label = this.timer.display_name();
        }
        this.layout.clear(elem);
        this.layout.render(elem);
      }


      if (this.listeners.timer_render_timeout) {
        clearTimeout(this.listeners.timer_render_timeout);
        this.listeners.timer_render_timeout = null;
      }

      // Set up timeout to render timer again when needed
      if (update_interval !== Infinity) {
        console.debug('Next render update scheduled in ' + update_interval);
        this.listeners.timer_render_timeout = setTimeout(
          () => {
              this.listeners.timer_render_timeout = null;
              this.render('timer');
          },
          update_interval
        );
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
      elem.font = row_font(id, tt.SETTINGS.format[id]);
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


class TimerFormatView {
  constructor(timer) {
    this.timer = timer;

    this.layout = null;
    this.listeners = {};

    // Get format name indeces for UI
    this.format_idx = {};
    for (var row_id of ROW_IDS) {
      let idx = FORMAT_MENU.indexOf(tt.SETTINGS.format[row_id]);
      if (idx === -1) {
        console.warn('Unknown format "' + tt.SETTINGS.format[row_id] + '"');
        idx = 0;
      }
      this.format_idx[row_id] = idx;
    }
  }

  start() {
    this._initLayout();
    this.layout.update();
    this.layout.clear();
    this.render();

    // Drag handler
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
        // Horizontal drag threshold reached
        // Increment or decrement row's format index based on sign of
        // distanceX
        for (var row_id of ROW_IDS) {
          if (ev.y < this.layout[row_id].y + this.layout[row_id].h) {
            Bangle.buzz(50, 0.5);
            if (Math.sign(distanceX) > 0) {
              this.incr_format_idx(row_id);
            } else {
              this.decr_format_idx(row_id);
            }
            distanceX = null;
            break;
          }
        }
      }
    }
    this.listeners.drag = dragHandler.bind(this);
    Bangle.on('drag', this.listeners.drag);

    // Touch handler
    function touchHandler(button, xy) {
      // Increment or decrement row's format index based on the arrow tapped
      for (let row_id of ROW_IDS) {
        for (let btn_id of ['prev', 'next']) {
          let elem = row_id + '.' + btn_id;
          if (xy.x >= this.layout[elem].x
              && xy.x <= this.layout[elem].x + this.layout[elem].w
              && xy.y >= this.layout[elem].y
              && xy.y <= this.layout[elem].y + this.layout[elem].h) {
            if (btn_id === 'prev') {
              this.decr_format_idx(row_id);
            } else {
              this.incr_format_idx(row_id);
            }
            break;
          }
        }
      }
    }
    this.listeners.touch = touchHandler.bind(this);
    Bangle.on('touch', this.listeners.touch);

    // Physical button handler
    this.listeners.button = setWatch(
      this.ok.bind(this),
      BTN,
      {edge: 'falling', debounce: 50, repeat: true}
    );
  }

  stop() {
    Bangle.removeListener('drag', this.listeners.drag);
    Bangle.removeListener('touch', this.listeners.touch);
    clearWatch(this.listeners.button);
  }

  _initLayout() {
    // Render right-pointing triangle if `flip`, else left-pointing
    // triangle
    function draw_triangle(lay, flip) {
      flip = flip ? lay.width : 0;
      g.setColor(g.theme.fg2)
       .fillPoly([flip + lay.x, lay.y + lay.height / 2,
                  lay.x + lay.width - flip, lay.y,
                  lay.x + lay.width - flip, lay.y + lay.height]);
    }

    const layout = new Layout(
      {
        type: 'v',
        bgCol: g.theme.bg,
        c: [
          {
            type: 'h',
            c: [
              {
                type: 'custom',
                id: 'row1.prev',
                render: lay => draw_triangle(lay, false),
                width: ARROW_BTN_SIZE,
                height: ARROW_BTN_SIZE,
              },
              {
                type: 'txt',
                id: 'row1',
                label: FORMAT_DISPLAY[FORMAT_MENU[this.format_idx.row1]],
                font: row_font('row1', 'mode'),
                fillx: 1,
              },
              {
                type: 'custom',
                id: 'row1.next',
                render: lay => draw_triangle(lay, true),
                width: ARROW_BTN_SIZE,
                height: ARROW_BTN_SIZE,
              },
            ],
          },
          {
            type: 'h',
            c: [
              {
                type: 'custom',
                id: 'row2.prev',
                render: lay => draw_triangle(lay, false),
                width: ARROW_BTN_SIZE,
                height: ARROW_BTN_SIZE,
              },
              {
                type: 'txt',
                id: 'row2',
                label: FORMAT_DISPLAY[FORMAT_MENU[this.format_idx.row2]],
                font: row_font('row2', 'mode'),
                fillx: 1,
              },
              {
                type: 'custom',
                id: 'row2.next',
                render: lay => draw_triangle(lay, true),
                width: ARROW_BTN_SIZE,
                height: ARROW_BTN_SIZE,
              },
            ],
          },
          {
            type: 'h',
            c: [
              {
                type: 'custom',
                id: 'row3.prev',
                render: lay => draw_triangle(lay, false),
                width: ARROW_BTN_SIZE,
                height: ARROW_BTN_SIZE,
              },
              {
                type: 'txt',
                id: 'row3',
                label: FORMAT_DISPLAY[FORMAT_MENU[this.format_idx.row3]],
                font: row_font('row3', 'mode'),
                fillx: 1,
              },
              {
                type: 'custom',
                id: 'row3.next',
                render: lay => draw_triangle(lay, true),
                width: ARROW_BTN_SIZE,
                height: ARROW_BTN_SIZE,
              },
            ],
          },
          {
            type: 'h',
            id: 'buttons',
            c: [
              {type: 'btn', font: '6x8:2', fillx: 1, label: 'Cancel', id: 'cancel_btn',
               cb: () => { this.cancel(); }
              },
              {type: 'btn', font: '6x8:2', fillx: 1, label: 'OK', id: 'ok_btn',
               cb: () => { this.ok(); }
              },
            ]
          }
        ]
      }
    );
    this.layout = layout;
  }

  render() {
    this.layout.render();
  }

  update_row(row_id) {
    const elem = this.layout[row_id];
    elem.label = FORMAT_DISPLAY[FORMAT_MENU[this.format_idx[row_id]]];
    this.layout.clear(elem);
    this.layout.render(elem);
  }

  incr_format_idx(row_id) {
    this.format_idx[row_id] += 1;
    if (this.format_idx[row_id] >= FORMAT_MENU.length) {
      this.format_idx[row_id] = 0;
    }
    this.update_row(row_id);
  }

  decr_format_idx(row_id) {
    this.format_idx[row_id] -= 1;
    if (this.format_idx[row_id] < 0) {
      this.format_idx[row_id] = FORMAT_MENU.length - 1;
    }
    this.update_row(row_id);
  }

  // Save new format settings and return to TimerView
  ok() {
    for (var row_id of ROW_IDS) {
      tt.SETTINGS.format[row_id] = FORMAT_MENU[this.format_idx[row_id]];
    }
    tt.set_settings_dirty();
    switch_UI(new TimerView(this.timer));
  }

  // Return to TimerViewMenu without saving changes
  cancel() {
    switch_UI(new TimerViewMenu(this.timer));
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
      'Format': () => {
        switch_UI(new TimerFormatView(this.timer));
      },
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
    let keyboard = null;
    try { keyboard = require("textinput"); } catch (e) {}

    const edit_menu = {
      '': {
        title: 'Edit: ' + this.timer.display_name(),
        back: () => { this.top_menu(); },
      },
      'Name': {
        value: this.timer.name,
        onchange: () => {
          setTimeout(() => {
            keyboard.input({text:this.timer.name}).then(text => {
              this.timer.name = text;
              tt.set_timers_dirty();
              setTimeout(() => { this.edit_menu(); }, 0);
            });
          }, 0);
        }
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

    if (!keyboard) {
      delete edit_menu.Name;
    }

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
