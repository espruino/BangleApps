Layout = require('Layout');
locale = require('locale');
storage = require('Storage');

// Storage filename to store user's timestamp log
const LOG_FILENAME = 'stamplog.json';

// Min number of pixels of movement to recognize a touchscreen drag/swipe
const DRAG_THRESHOLD = 10;

var settings = {
  logItemFont: '12x20'
};


// Fetch a stringified image
function getIcon(id) {
  if (id == 'add') {
//     Graphics.createImage(`
//   XX        X  X   X  X
//   XX       X  X   X  X
// XXXXXX    X  X   X  X
// XXXXXX   X  X   X  X
//   XX    X  X   X  X
//   XX   X  X   X  X
//       X XX   X  X
//       X  X  X  X
//      X    XX  X
//      X     X X
//     X       X
//     X     XX
//    XXX  XX
//    XXXXX
//   XXXX
//   XX
// `);
    return "\0\x17\x10\x81\x000\t\x12`$K\xF0\x91'\xE2D\x83\t\x12\x06$H\x00\xB1 \x01$\x80\x042\x00\b(\x00  \x00A\x80\x01\xCC\x00\x03\xE0\x00\x0F\x00\x00\x18\x00\x00";
  } else if (id == 'menu') {
//     Graphics.createImage(`
//
//
//
//
// XXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXX
//
//
// XXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXX
//
//
// XXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXX
//
//
// `);
    return "\0\x10\x10\x81\0\0\0\0\0\0\0\0\0\xFF\xFF\xFF\xFF\0\0\0\0\xFF\xFF\xFF\xFF\0\0\0\0\xFF\xFF\xFF\xFF\0\0\0\0";
  }
}


//// Data models //////////////////////////////////

// High-level timestamp log object that provides an interface to the
// UI for managing log entries and automatically loading/saving
// changes to flash storage.
class StampLog {
  constructor(filename) {
    // Name of file to save log to
    this.filename = filename;

    // `true` when we have changes that need to be saved
    this.isDirty = false;
    // Wait at most this many msec upon first data change before
    // saving (this is to avoid excessive writes to flash if several
    // changes happen quickly; we wait a little bit so they can be
    // rolled into a single write)
    this.saveTimeout = 30000;
    // setTimeout ID for scheduled save job
    this.saveId = null;
    // Underlying raw log data object. Outside this class it's
    // recommended to use only the class methods to change it rather
    // than modifying the object directly to ensure that changes are
    // recognized and saved to storage.
    this.log = this.load();
  }

  // Return the version of the log data that is currently in storage
  load() {
    let log = storage.readJSON(this.filename, true);
    if (!log) log = [];
    // Convert stringified datetimes back into Date objects
    for (let logEntry of log) {
      logEntry.stamp = new Date(logEntry.stamp);
    }
    return log;
  }

  // Write current log data to storage if anything needs to be saved
  save() {
    // Cancel any pending scheduled calls to save()
    if (this.saveId) {
      clearTimeout(this.saveId);
      this.saveId = null;
    }

    if (this.isDirty) {
      if (storage.writeJSON(this.filename, this.log)) {
        console.log('stamplog: save to storage completed');
        this.isDirty = false;
      } else {
        console.log('stamplog: save to storage FAILED');
        this.emit('saveError');
      }
    } else {
      console.log('stamplog: skipping save to storage because no changes made');
    }
  }

  // Mark log as needing to be (re)written to storage
  setDirty() {
    this.isDirty = true;
    if (!this.saveId) {
      this.saveId = setTimeout(this.save.bind(this), this.saveTimeout);
    }
  }

  // Add a timestamp for the current time to the end of the log
  addEntry() {
    this.log.push({
      stamp: new Date()
    });
    this.setDirty();
  }

  // Delete the log objects given in the array `entries` from the log
  deleteEntries(entries) {
    this.log = this.log.filter(entry => !entries.includes(entry));
    this.setDirty();
  }
}


//// UI ///////////////////////////////////////////

// UI layout render callback for log entries
function renderLogItem(elem) {
  if (elem.item) {
    g.setColor(g.theme.bg)
     .fillRect(elem.x, elem.y, elem.x + elem.w - 1, elem.y + elem.h - 1)
     .setFont('12x20')
     .setFontAlign(-1, -1)
     .setColor(g.theme.fg)
     .drawLine(elem.x, elem.y, elem.x + elem.w - 1, elem.y)
     .drawString(locale.date(elem.item.stamp, 1)
                 + '\n'
                 + locale.time(elem.item.stamp).trim(),
                 elem.x, elem.y);
  } else {
    g.setColor(g.blendColor(g.theme.bg, g.theme.fg, 0.25))
     .fillRect(elem.x, elem.y, elem.x + elem.w - 1, elem.y + elem.h - 1);
  }
}

// Main app screen interface, launched by calling start()
class MainScreen {
  constructor(stampLog) {
    this.stampLog = stampLog;

    // Values set up by start()
    this.logItemsPerPage = null;
    this.logScrollPos = null;
    this.layout = null;

    // Handlers/listeners
    this.buttonTimeoutId = null;
    this.listeners = {};
  }

  // Launch this UI and make it live
  start() {
    this.layout = this.getLayout();
    mainScreen.scrollLog('b');
    mainScreen.render();

    Object.assign(this.listeners, this.getTouchListeners());
    Bangle.on('drag', this.listeners.drag);
  }

  // Stop this UI, shut down all timers/listeners, and otherwise clean up
  stop() {
    if (this.buttonTimeoutId) {
      clearTimeout(this.buttonTimeoutId);
      this.buttonTimeoutId = null;
    }

    // Kill layout handlers
    Bangle.removeListener('drag', this.listeners.drag);
    Bangle.setUI();

    // Probably not necessary, but provides feedback for debugging :-)
    g.clear();
  }

  // Generate the layout structure for the main UI
  getLayout() {
    let layout = new Layout(
      {type: 'v',
       c: [
         // Placeholder to force bottom alignment when there is unused
         // vertical screen space
         {type: '', id: 'placeholder', fillx: 1, filly: 1},

         {type: 'v',
          id: 'logItems',

          // To be filled in with log item elements once we determine
          // how many will fit on screen
          c: [],
         },

         {type: 'h',
          id: 'buttons',
          c: [
            {type: 'btn', font: '6x8:2', fillx: 1, label: '+ XX:XX', id: 'addBtn',
             cb: this.addTimestamp.bind(this)},
            {type: 'btn', font: '6x8:2', label: getIcon('menu'), id: 'menuBtn',
             cb: L => console.log(L)},
          ],
         },
       ],
      }
    );

    // Calculate how many log items per page we have space to display
    layout.update();
    let availableHeight = layout.placeholder.h;
    g.setFont(settings.logItemFont);
    let logItemHeight = g.getFontHeight() * 2;
    this.logItemsPerPage = Math.floor(availableHeight / logItemHeight);

    // Populate log items in layout
    for (i = 0; i < this.logItemsPerPage; i++) {
      layout.logItems.c.push(
        {type: 'custom', render: renderLogItem, item: undefined, fillx: 1, height: logItemHeight}
      );
    }
    layout.update();

    return layout;
  }

  // Redraw a particular display `item`, or everything if `item` is falsey
  render(item) {
    if (!item || item == 'log') {
      let layLogItems = this.layout.logItems;
      let logIdx = this.logScrollPos - this.logItemsPerPage;
      for (let elem of layLogItems.c) {
        logIdx++;
        elem.item = this.stampLog.log[logIdx];
      }
      this.layout.render(layLogItems);
    }

    if (!item || item == 'buttons') {
      this.layout.addBtn.label = getIcon('add') + ' ' + locale.time(new Date(), 1).trim();
      this.layout.render(this.layout.buttons);

      // Auto-update time of day indication on log-add button upon next minute
      if (!this.buttonTimeoutId) {
        this.buttonTimeoutId = setTimeout(
          () => {
            this.buttonTimeoutId = null;
            this.render('buttons');
          },
          60000 - (Date.now() % 60000)
        );
      }
    }

  }

  getTouchListeners() {
    let distanceY = null;

    function dragHandler(ev) {
      // Handle up/down swipes for scrolling
      if (ev.b) {
        if (distanceY === null) {
          // Drag started
          distanceY = ev.dy;
        } else {
          // Drag in progress
          distanceY += ev.dy;
        }
      } else {
        // Drag ended
        if (Math.abs(distanceY) > DRAG_THRESHOLD) {
          this.scrollLog(distanceY > 0 ? 'u' : 'd');
          this.render('log');
        }
        distanceY = null;
      }
    }

    return {
      'drag': dragHandler.bind(this),
    };
  }

  // Add current timestamp to log and update UI display
  addTimestamp() {
    this.stampLog.addEntry();
    this.scrollLog('b');
    this.render('log');
  }

  // Scroll display in given direction or to given position:
  // 'u': up, 'd': down, 't': to top, 'b': to bottom
  scrollLog(how) {
    top = (this.stampLog.log.length - 1) % this.logItemsPerPage;
    bottom = this.stampLog.log.length - 1;

    if (how == 'u') {
      this.logScrollPos -= this.logItemsPerPage;
    } else if (how == 'd') {
      this.logScrollPos += this.logItemsPerPage;
    } else if (how == 't') {
      this.logScrollPos = top;
    } else if (how == 'b') {
      this.logScrollPos = bottom;
    }

    this.logScrollPos = E.clip(this.logScrollPos, top, bottom);
  }
}


Bangle.loadWidgets();
Bangle.drawWidgets();

stampLog = new StampLog();
E.on('kill', stampLog.save.bind(stampLog));
stampLog.on('saveError', () => {
  E.showAlert('Trouble saving timestamp log: Data may be lost!',
              "Can't save log");
});

mainScreen = new MainScreen(stampLog);
mainScreen.start();
