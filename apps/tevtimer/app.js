const Layout = require('Layout');
const locale = require('locale');
const pickers = require('more_pickers');

const tt = require('tevtimer');


// UI //

// Length of time displaying timer view before moving timer to top of
// timer list
const MOVE_TO_TOP_TIMEOUT = 5000;

// Min number of pixels of movement to recognize a touchscreen drag/swipe
const DRAG_THRESHOLD = 50;

// Physical left/right button size in UI
const ARROW_BTN_SIZE = 15;

// IDs of main screen labels
const ROW_IDS = ['row1', 'row2', 'row3'];

// Fonts to use for each screen label and display format
const FONT = {
  'row1': {
    'start hh:mm:ss': '12x20',
    'current hh:mm:ss': '12x20',
    'time hh:mm:ss': '12x20',

    'start hh:mm': '12x20',
    'current hh:mm': '12x20',
    'time hh:mm': '12x20',

    'start auto': '12x20',
    'current auto': '12x20',
    'time auto': '12x20',

    'name': '12x20',

    'format-menu': '12x20',
  },

  'row2': {
    'start hh:mm:ss': 'Vector:34x42',
    'current hh:mm:ss': 'Vector:34x42',
    'time hh:mm:ss': 'Vector:24x42',

    'start hh:mm': 'Vector:48x42',
    'current hh:mm': 'Vector:48x42',
    'time hh:mm': 'Vector:56x42',

    'start auto': 'Vector:34x42',
    'current auto': 'Vector:34x42',
    'time auto': 'Vector:24x42',

    'name': 'Vector:24x42',

    'format-menu': 'Vector:26x42',
  },

  'row3': {
    'start hh:mm:ss': 'Vector:34x56',
    'current hh:mm:ss': 'Vector:34x56',
    'time hh:mm:ss': 'Vector:24x56',

    'start hh:mm': 'Vector:48x56',
    'current hh:mm': 'Vector:48x56',
    'time hh:mm': 'Vector:56x56',

    'start auto': 'Vector:34x56',
    'current auto': 'Vector:34x56',
    'time auto': 'Vector:24x56',

    'name': 'Vector:24x56',

    'format-menu': 'Vector:26x56',
  }
};

// List of format IDs available in the format menu
// (in the order they are displayed in the menu)
const FORMAT_MENU = [
  'start auto',
  'start hh:mm:ss',
  'start hh:mm',
  'current auto',
  'current hh:mm:ss',
  'current hh:mm',
  'time auto',
  'time hh:mm:ss',
  'time hh:mm',
  'name',
];

// Mapping of format IDs to their human-friendly names displayed in the
// format menu
const FORMAT_DISPLAY = {
  'start auto': 'Start Auto',
  'start hh:mm:ss': 'Start HMS',
  'start hh:mm': 'Start HM',
  'current auto': 'Curr Auto',
  'current hh:mm:ss': 'Curr HMS',
  'current hh:mm': 'Curr HM',
  'time auto': 'Time Auto',
  'time hh:mm:ss': 'Time HMS',
  'time hh:mm': 'Time HM',
  'name': 'Name',
};


function row_font(row_name, format) {
  // Convenience function to retrieve the font ID for the given display
  // field and format mode

  let font = FONT[row_name][format];
  if (font === undefined) {
    console.error('Unknown font for row_font("' + row_name + '", "' + format + '")');
    return '12x20';
  }
  return font;
}


function next_time_update(interval, curr_time, direction) {
  // Determine time in milliseconds until next display update for a timer
  // that should be updated every `interval` milliseconds.
  //
  // `curr_time` is the current time in milliseconds, and `direction`
  // is either 1 (forward) or -1 (backward). The function returns the
  // time in milliseconds until the next update, or Infinity if there
  // is no update needed (e.g. if interval is zero or negative).

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


function draw_triangle(lay, flip) {
  // Render right-pointing triangle if `flip`, else left-pointing
  // triangle

  flip = flip ? lay.width : 0;
  g.setColor(g.theme.fg2)
   .fillPoly([flip + lay.x, lay.y + lay.height / 2,
              lay.x + lay.width - flip, lay.y,
              lay.x + lay.width - flip, lay.y + lay.height]);
}


function update_status_widget(timer) {
  // Update the status widget with the current timer status. The
  // timer is passed as a parameter.

  function widget_draw() {
    // Draw a right-pointing arrow if the timer is running

    g.reset();
    if (WIDGETS.tevtimer.width > 1) {
      draw_triangle({
        x: WIDGETS.tevtimer.x,
        // Center the arrow vertically in the 24-pixel-height widget area
        y: WIDGETS.tevtimer.y + Math.floor((24 - ARROW_BTN_SIZE) / 2),
        width: ARROW_BTN_SIZE,
        height: ARROW_BTN_SIZE
      }, true);
    }
  }

  // For some reason, a width of 0 when there's nothing to display
  // doesn't work as expected, so we use 1 instead.
  let width = timer.is_running() ? ARROW_BTN_SIZE : 1;

  if (WIDGETS.tevtimer === undefined) {
    WIDGETS.tevtimer = {
      area: 'tr',
      draw: widget_draw,
    };
  }
  WIDGETS.tevtimer.width = width;
  Bangle.drawWidgets();
}


// UI modes //

class TimerView {
  // Primary UI for displaying and operating a timer. The
  // PrimitiveTimer object is passed to the constructor as a
  // parameter.

  constructor(timer) {
    this.timer = timer;

    this.layout = null;
    this.listeners = {};
    this.listeners.timer_render_timeout = null;
  }

  start() {
    // Initialize, display, and activate the UI

    this._initLayout();
    this.layout.update();
    this.layout.clear();
    this.render();

    // Physical button handler
    this.listeners.button = setWatch(
      () => { this.dispatch_action(tt.SETTINGS.button_act); },
      BTN,
      {edge: 'falling', debounce: 50, repeat: true}
    );

    // Tap handler
    function tapHandler(button, xy) {
      // Check if the tap was in the area of the timer display
      if (xy.y < this.layout.buttons.y) {
        // Dispatch action specified based on left or right half of display tapped
        if (xy.x < this.layout.row1.x + this.layout.row1.w / 2) {
          this.dispatch_action(tt.SETTINGS.left_tap_act);
        } else {
          this.dispatch_action(tt.SETTINGS.right_tap_act);
        }
      }
    }
    this.listeners.tap = tapHandler.bind(this);
    Bangle.on('touch', this.listeners.tap);

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

    // Screen lock/unlock handler
    function lockHandler() {
      // If 'current auto' is an active format, update the timer
      // display
      for (var id of ROW_IDS) {
        if (tt.SETTINGS.format[id] == 'current auto') {
          this.render('timer');
          break;
        }
      }
    }
    this.listeners.lock = lockHandler.bind(this);
    Bangle.on('lock', this.listeners.lock);
  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    if (this.listeners.timer_render_timeout !== null) {
      clearTimeout(this.listeners.timer_render_timeout);
      this.listeners.timer_render_timeout = null;
    }
    clearWatch(this.listeners.button);
    Bangle.removeListener('touch', this.listeners.tap);
    Bangle.removeListener('drag', this.listeners.drag);
    clearTimeout(this.listeners.to_top_timeout);
    Bangle.removeListener('lock', this.listeners.lock);
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
    // Draw the timer display and update the status and buttons. The
    // `item` parameter specifies which part of the display to update.
    // If `item` is not specified, the entire display is updated.

    console.debug('render called: ' + item);

    if (!item) {
      this.layout.update();
    }

    if (!item || item == 'timer') {

      let update_interval = Infinity;

      for (var id of ROW_IDS) {
        const elem = this.layout[id];
        const running = this.timer.is_running();

        let format = tt.SETTINGS.format[id];
        // Special handling for “auto” formats
        if (format == 'start auto') {
          format = Bangle.isLocked() ? 'start hh:mm' : 'start hh:mm:ss';
        } else if (format == 'current auto') {
          format = Bangle.isLocked() ? 'current hh:mm' : 'current hh:mm:ss';
        } else if (format == 'time auto') {
          format = Bangle.isLocked() ? 'time hh:mm' : 'time hh:mm:ss';
        }

        if (format == 'start hh:mm:ss') {
          elem.label = tt.format_duration(this.timer.to_msec(this.timer.origin), true);

        } else if (format == 'current hh:mm:ss') {
          elem.label = tt.format_duration(this.timer.to_msec(), true);
          if (running) {
            update_interval = Math.min(
              update_interval,
              next_time_update(1000, this.timer.to_msec(), this.timer.rate)
            );
          }

        } else if (format == 'time hh:mm:ss') {
          elem.label = locale.time(new Date()).trim();
          update_interval = Math.min(
            update_interval,
            next_time_update(1000, Date.now(), 1)
          );

        } else if (format == 'start hh:mm') {
          elem.label = tt.format_duration(this.timer.to_msec(this.timer.origin), false);

        } else if (format == 'current hh:mm') {
          elem.label = tt.format_duration(this.timer.to_msec(), false);
          if (running) {
            // Update every minute for current HM when running
            update_interval = Math.min(
              update_interval,
              next_time_update(60000, this.timer.to_msec(), this.timer.rate)
            );
          }

        } else if (format == 'time hh:mm') {
          elem.label = locale.time(new Date(), 1).trim();
          update_interval = Math.min(
            update_interval,
            next_time_update(60000, Date.now(), 1)
          );

        } else if (format == 'name') {
          elem.label = this.timer.display_name();
        }

        elem.font = row_font(id, format);
        this.layout.clear(elem);
        this.layout.render(elem);
      }


      if (this.listeners.timer_render_timeout) {
        clearTimeout(this.listeners.timer_render_timeout);
        this.listeners.timer_render_timeout = null;
      }

      // Set up timeout to render timer again when needed
      if (update_interval !== Infinity) {
        console.debug('Next render update scheduled in ' + update_interval + ' ms');
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
      update_status_widget(this.timer);
    }
  }

  start_stop_timer() {
    // Start or pause the timer

    if (this.timer.is_running()) {
      this.timer.pause();
    } else {
      this.timer.start();
    }
    tt.set_timers_dirty();
    this.render('status');
    this.render('timer');
  }

  dispatch_action(action) {
    // Execute a UI action represented by the string `action`.

    if (action === 'start/stop') {
      this.start_stop_timer()

    } else if (action === 'reset') {
      switch_UI(
        new ResetTimer(
          this.timer,
          () => { switch_UI(new TimerView(this.timer)); }
        )
      );

    } else if (action === 'timers') {
      switch_UI(
        new TimerMenu(
          tt.TIMERS,
          this.timer,
          (timer, focused_timer) => {
            switch_UI(new TimerView(timer || focused_timer));
          }
        )
      );

    } else if (action == 'edit') {
      switch_UI(new TimerEditMenu(
        this.timer,
        () => { switch_UI(new TimerView(this.timer)); }
      ));

    } else if (action === 'edit_start') {
      switch_UI(new TimerEditStart(
        this.timer,
        () => { switch_UI(new TimerView(this.timer)); }
      ));

    } else if (action == 'format') {
      switch_UI(new TimerFormatView(
        this.timer,
        () => { switch_UI(new TimerView(this.timer)); }
      ));

    }
  }
}


class TimerFormatView {
  // UI for selecting the display format of a timer.

  constructor(timer, back) {
    // `timer` is the current PrimitiveTimer object being edited.
    // `back` is the function that activates the previous UI to return
    // to when the format selection is exited. It is passed `true` if
    // the format change was confirmed and `false` if it was canceled.
    // If `back` is not specified, a default back handler is used that
    // returns to the TimerView if accepted or TimerViewMenu if
    // canceled.

    this.timer = timer;
    this.back = back || this._back;

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

  _back(ok) {
    // Default back handler
    if (ok) {
      switch_UI(new TimerView(this.timer));
    } else {
      switch_UI(new TimerViewMenu(this.timer));
    }
  }

  start() {
    // Initialize, display, and activate the UI

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

      // Enlarge tap area by this amount in the X direction to make it
      // easier to hit
      const x_tolerance = 20;

      for (let row_id of ROW_IDS) {
        for (let btn_id of ['prev', 'next']) {
          let elem = row_id + '.' + btn_id;
          if (xy.x >= this.layout[elem].x - x_tolerance
              && xy.x <= this.layout[elem].x + this.layout[elem].w + x_tolerance
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
      this.cancel.bind(this),
      BTN,
      {edge: 'falling', debounce: 50, repeat: true}
    );
  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    Bangle.removeListener('drag', this.listeners.drag);
    Bangle.removeListener('touch', this.listeners.touch);
    clearWatch(this.listeners.button);
  }

  _initLayout() {
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
                font: row_font('row1', 'format-menu'),
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
                font: row_font('row2', 'format-menu'),
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
                font: row_font('row3', 'format-menu'),
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
    // Draw the format selection UI.

    this.layout.render();
  }

  update_row(row_id) {
    // Render the display format for the given row ID. The row ID
    // should be one of 'row1', 'row2', or 'row3'.

    const elem = this.layout[row_id];
    elem.label = FORMAT_DISPLAY[FORMAT_MENU[this.format_idx[row_id]]];
    this.layout.clear(elem);
    this.layout.render(elem);
  }

  incr_format_idx(row_id) {
    // Increment the selected format for the given row ID. The row ID
    // should be one of 'row1', 'row2', or 'row3'.

    this.format_idx[row_id] += 1;
    if (this.format_idx[row_id] >= FORMAT_MENU.length) {
      this.format_idx[row_id] = 0;
    }
    this.update_row(row_id);
  }

  decr_format_idx(row_id) {
    // Decrement the selected format for the given row ID. The row ID
    // should be one of 'row1', 'row2', or 'row3'.

    this.format_idx[row_id] -= 1;
    if (this.format_idx[row_id] < 0) {
      this.format_idx[row_id] = FORMAT_MENU.length - 1;
    }
    this.update_row(row_id);
  }

  ok() {
    // Save new format settings and return to TimerView
    for (var row_id of ROW_IDS) {
      tt.SETTINGS.format[row_id] = FORMAT_MENU[this.format_idx[row_id]];
    }
    tt.set_settings_dirty();
    this.back(true);
  }

  cancel() {
    // Return to TimerViewMenu without saving changes
    this.back(false);
  }
}


class TimerViewMenu {
  // UI for displaying the timer menu.

  constructor(timer, back) {
    // `timer` is the PrimitiveTimer object whose menu is being
    // displayed. `back` is a function that activates the previous UI
    // to return to when the menu is exited.

    this.timer = timer;
    this.back = back || this._back;
  }

  _back() {
    // Default back handler
    // Return to TimerView for the current timer
    switch_UI(new TimerView(this.timer));
  }

  start() {
    // Display and activate the timer view menu.

    const menu = {
      '': {
        title: this.timer.display_name(),
        back: (() => { this.back(); }),
      },
      'Reset': () => { switch_UI(new ResetTimer(this.timer)); },
      'Timers': () => { switch_UI(new TimerMenu(tt.TIMERS, this.timer)); },
      'Edit': () => { switch_UI(new TimerEditMenu(this.timer)); },
      'Format': () => { switch_UI(new TimerFormatView(this.timer)); },
      'Add': () => {
        tt.set_timers_dirty();
        const new_timer = tt.add_timer(tt.TIMERS, this.timer);
        switch_UI(new TimerEditMenu(new_timer));
      },
      'Delete': () => { switch_UI(new DeleteTimer(this.timer)); },
      'Settings': () => { switch_UI(new AppSettingsMenu(this.timer)); },
    };
    if (tt.TIMERS.length <= 1) {
      // Prevent user deleting last timer
      delete menu.Delete;
    }

    E.showMenu(menu);
  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    E.showMenu();
  }

}

class ResetTimer {
  // UI for resetting a timer.

  constructor(timer, back) {
    // `timer` is the PrimitiveTimer object to reset.
    // `back` is a function that activates the previous UI to return
    // to when the menu is exited. It is passed `true` if the timer is
    // reset and `false` if it is canceled. If `back` is not
    // specified, a default back handler is used that returns to
    // TimerView if accepted or TimerViewMenu if canceled.

    this.timer = timer;
    this.back = back || this._back;
  }

  _back(ok) {
    // Default back handler

    if (ok) {
      switch_UI(new TimerView(this.timer));
    } else {
      switch_UI(new TimerViewMenu(this.timer));
    }
  }

  start() {
    // Display and activate the reset timer confirmation menu if
    // configured in settings, or immediately reset the timer if not.

    const menu = {
      '': {
        title: 'Confirm reset',
        back: () => { this.back(false); }
      },
      'Reset': () => {
        this.timer.reset();
        tt.set_timers_dirty();
        this.back(true);
      },
      'Cancel': () => { this.back(false); },
    };

    if (tt.SETTINGS.confirm_reset === true
        || (tt.SETTINGS.confirm_reset === 'auto'
            && this.timer.to_msec() > 0)) {
      E.showMenu(menu);
    } else {
      menu.Reset();
    }
  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    E.showMenu();
  }
}

class DeleteTimer {
  // UI for deleting a timer.

  constructor(timer, back) {
    // `timer` is the PrimitiveTimer object to delete. `back` is a
    // function that activates the previous UI to return to when the
    // menu is exited. It is passed `true` for the first parameter if
    // the timer is deleted and `false` if it is canceled. For the
    // second parameter, it is passed the same timer if canceled or
    // another existing timer in the list if the given timer was
    // deleted. If `back` is not specified, a default back handler is
    // used that returns to TimerView if accepted or TimerViewMenu if
    // canceled.

    this.timer = timer;
    this.back = back || this._back;
  }

  _back(ok, timer) {
    // Default back handler

    if (ok) {
      switch_UI(new TimerView(timer));
    } else {
      switch_UI(new TimerViewMenu(timer));
    }
  }

  start() {
    // Display and activate the delete timer confirmation menu if
    // configured in settings, or immediately delete the timer if
    // not.

    const menu = {
      '': {
        title: 'Confirm delete',
        back: () => { this.back(false, this.timer); }
      },
      'Delete': () => {
        tt.set_timers_dirty();
        this.back(true, tt.delete_timer(tt.TIMERS, this.timer));
      },
      'Cancel': () => { this.back(false, this.timer) },
    };

    if (tt.SETTINGS.confirm_delete) {
      E.showMenu(menu);
    } else {
      menu.Delete();
    }

  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    E.showMenu();
  }
}

class TimerEditMenu {
  // UI for editing a timer.

  constructor(timer, back) {
    // `timer` is the PrimitiveTimer object to edit. `back` is a
    // function that activates the previous UI to return to when the
    // menu is exited. If `back` is not specified, a default back
    // handler is used that returns to TimerViewMenu.

    this.timer = timer;
    this.back = back || this._back;
  }

  _back() {
    // Default back handler

    switch_UI(new TimerViewMenu(this.timer));
  }

  start() {
    // Display the edit menu for the timer.

    let keyboard = null;
    try { keyboard = require("textinput"); } catch (e) {}

    const menu = {
      '': {
        title: 'Edit: ' + this.timer.display_name(),
        back: () => { this.back(); }
      },
      'Name': {
        value: this.timer.name,
        onchange: () => {
          setTimeout(() => {
            keyboard.input({text:this.timer.name}).then(text => {
              this.timer.name = text;
              tt.set_timers_dirty();
              switch_UI(this);
            });
          }, 0);
        }
      },
      'Start': () => {
        switch_UI(new TimerEditStart(
          this.timer,
          () => { switch_UI(this); }
        )
      );
      },
      'At end': {
        // Option to auto-start another timer when this one ends
        format: v => v === -1
                     ? "Stop"
                     : tt.TIMERS[v].display_status()
                       + ' '
                       + tt.TIMERS[v].display_name(),
        value: tt.find_timer_by_id(this.timer.chain_id),
        min: -1,
        max: tt.TIMERS.length - 1,
        onchange: v => {
          this.timer.chain_id = v === -1 ? null : tt.TIMERS[v].id;
          tt.set_timers_dirty();
        }
      },
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
      // Hide the Name menu item if text input module is not available
      delete menu.Name;
    }

    E.showMenu(menu);
  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    E.showMenu();
  }
}


class TimerEditStart {
  // UI for editing the timer's starting value.

  constructor(timer, back) {
    // `timer` is the PrimitiveTimer object to edit. `back` is a
    // function that activates the previous UI to return to when the
    // menu is exited. It is passed `true` if the timer is edited and
    // `false` if it is canceled. If `back` is not specified, a
    // default back handler is used that returns to TimerView.

    this.timer = timer;
    this.back = back || this._back;
  }

  _back(ok) {
    // Default back handler

    switch_UI(new TimerEditMenu(this.timer));
  }

  start() {
    // Display the edit > start menu for the timer

    var ok = false;

    let origin_hms = {
      h: Math.floor(this.timer.origin / 3600),
      m: Math.floor(this.timer.origin / 60) % 60,
      s: Math.floor(this.timer.origin % 60),
    };

    function picker_format(v) {
      // Display leading 0 for single digit values in the picker
      return v < 10 ? '0' + v : v;
    }

    pickers.triplePicker({
      title: "Set Start",
      value_1: origin_hms.h,
      value_2: origin_hms.m,
      value_3: origin_hms.s,
      format_2: picker_format,
      format_3: picker_format,
      min_1: 0,
      max_1: 99,
      min_2: 0,
      max_2: 59,
      min_3: 0,
      max_3: 59,
      wrap_1: false,
      wrap_2: true,
      wrap_3: true,
      separator_1: ':',
      separator_2: ':',
      back: () => { this.back(ok); },
      onchange: (h, m, s) => {
        ok = true;
        this.timer.origin = h * 3600 + m * 60 + s;
        tt.set_timers_dirty();
      }
    });
  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    E.showMenu();
  }
}


class TimerMenu {
  // UI for choosing among the list of defined timers.

  constructor(timers, focused_timer, back) {
    // `timers` is the list of PrimitiveTimer objects to display.
    // `focused_timer` is the PrimitiveTimer object that is currently
    // being displayed. `back` is a function that activates the
    // previous UI to return to when the menu is exited. It is passed
    // the selected timer object if a timer is selected or `null` if
    // the menu is canceled, and the last-focused timer object. If not
    // specified, a default back handler is used that returns to
    // TimerView for the selected timer or TimerViewMenu if canceled.

    this.timers = timers;
    this.focused_timer = focused_timer;
    this.back = back || this._back;
  }

  _back(timer, focused_timer) {
    // Default back handler

    if (timer) {
      switch_UI(new TimerView(timer));
    } else {
      switch_UI(new TimerViewMenu(focused_timer));
    }
  }

  start() {
    // Display the timer menu

    let menu = {
      '': {
        title: "Timers",
        back: () => { this.back(null, this.focused_timer); }
      }
    };
    this.timers.forEach((timer) => {
      menu[timer.display_status() + ' ' + timer.display_name()] =
        () => { this.back(timer, this.focused_timer); };
    });
    E.showMenu(menu);
  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    E.showMenu();
  }
}


class AppSettingsMenu {
  // UI for displaying the app settings menu.

  constructor(timer, back) {
    // `timer` is the last focused timer object (only used for default
    // back handler described below).
    // `back` is a function that activates the previous UI to
    // return to when the menu is exited. If not specified, a default
    // back handler is used that returns to the TimerViewMenu for the
    // last-focused timer.
    this.timer = timer;
    this.back = back || this._back;
  }

  _back() {
    // Default back handler
    switch_UI(new TimerViewMenu(this.timer));
  }

  start() {
    // Display the app settings menu

    const menu = {
      '': {
        title: 'Settings',
        back: () => { this.back(); }
      },
      'Button': {
        value: tt.ACTIONS.indexOf(tt.SETTINGS.button_act),
        min: 0,
        max: tt.ACTIONS.length - 1,
        format: v => tt.ACTION_NAMES[tt.ACTIONS[v]],
        onchange: v => {
          tt.SETTINGS.button_act = tt.ACTIONS[v];
          tt.set_settings_dirty();
        }
      },
      'Tap left': {
        value: tt.ACTIONS.indexOf(tt.SETTINGS.left_tap_act),
        min: 0,
        max: tt.ACTIONS.length - 1,
        format: v => tt.ACTION_NAMES[tt.ACTIONS[v]],
        onchange: v => {
          tt.SETTINGS.left_tap_act = tt.ACTIONS[v];
          tt.set_settings_dirty();
        }
      },
      'Tap right': {
        value: tt.ACTIONS.indexOf(tt.SETTINGS.right_tap_act),
        min: 0,
        max: tt.ACTIONS.length - 1,
        format: v => tt.ACTION_NAMES[tt.ACTIONS[v]],
        onchange: v => {
          tt.SETTINGS.right_tap_act = tt.ACTIONS[v];
          tt.set_settings_dirty();
        }
      },
      'Confirm reset': {
        value: [true, 'auto', false].indexOf(tt.SETTINGS.confirm_reset),
        format: v => ['Always', 'Auto', 'Never'][v],
        min: 0,
        max: 2,
        onchange: v => {
          tt.SETTINGS.confirm_reset = [true, 'auto', false][v];
          tt.set_settings_dirty();
        }
      },
      'Confirm delete': {
        value: tt.SETTINGS.confirm_delete,   // boolean
        format: v => v ? 'Always' : 'Never',
        onchange: v => {
          tt.SETTINGS.confirm_delete = v;
          tt.set_settings_dirty();
        }
      },
      'On alarm go to': {
        value: tt.SETTINGS.alarm_return,    // boolean
        format: v => v ? 'Timer' : 'Clock',
        onchange: v => {
          tt.SETTINGS.alarm_return = v;
          tt.set_settings_dirty();
        }
      },
      'Auto reset': {
        value: tt.SETTINGS.auto_reset,      // boolean
        onchange: v => {
          tt.SETTINGS.auto_reset = v;
          tt.set_settings_dirty();
        }
      }
    };

    E.showMenu(menu);
  }

  stop() {
    // Shut down the UI and clean up listeners and handlers

    E.showMenu();
  }
}


function switch_UI(new_UI) {
  // Switch from one UI mode to another (after current call stack
  // completes). The new UI instance is passed as a parameter. The old
  // UI is stopped and cleaned up, and the new UI is started.

  setTimeout(() => {
    if (CURRENT_UI) {
      CURRENT_UI.stop();
    }
    CURRENT_UI = new_UI;
    CURRENT_UI.start();
  }, 0);
}


// Load and start up app //

Bangle.loadWidgets();
Bangle.drawWidgets();

var CURRENT_UI = null;

tt.update_system_alarms();

update_status_widget(tt.TIMERS[0]);
switch_UI(new TimerView(tt.TIMERS[0]));
