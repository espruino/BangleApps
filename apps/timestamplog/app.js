const Layout = require('Layout');
const locale = require('locale');

const tsl = require('timestamplog');


// Min number of pixels of movement to recognize a touchscreen drag/swipe
const DRAG_THRESHOLD = 30;

// Width of scroll indicators
const SCROLL_BAR_WIDTH = 12;


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


// UI layout render callback for log entries
function renderLogItem(elem) {
  if (elem.item) {
    g.setColor(g.theme.bg)
     .fillRect(elem.x, elem.y, elem.x + elem.w - 1, elem.y + elem.h - 1)
     .setFont(tsl.fontSpec(tsl.SETTINGS.logFont,
                       tsl.SETTINGS.logFontHSize, tsl.SETTINGS.logFontVSize))
     .setFontAlign(-1, -1)
     .setColor(g.theme.fg)
     .drawLine(elem.x, elem.y, elem.x + elem.w - 1, elem.y)
     .drawString(locale.date(elem.item.stamp, 1)
                 + '\n'
                 + locale.time(elem.item.stamp).trim(),
                 elem.x, elem.y + 1);
  } else {
    g.setColor(g.blendColor(g.theme.bg, g.theme.fg, 0.25))
     .fillRect(elem.x, elem.y, elem.x + elem.w - 1, elem.y + elem.h - 1);
  }
}

// Render a scroll indicator
// `scroll` format: {
//   pos: int,
//   min: int,
//   max: int,
//   itemsPerPage: int,
// }
function renderScrollBar(elem, scroll) {
  const border = 1;
  const boxArea = elem.h - 2 * border;
  const boxSize = E.clip(
    Math.round(
      scroll.itemsPerPage / (scroll.max - scroll.min + 1) * (elem.h - 2)
    ),
    3,
    boxArea
  );
  const boxTop =  (scroll.max - scroll.min) ?
    Math.round(
      (scroll.pos - scroll.min) / (scroll.max - scroll.min)
      * (boxArea - boxSize) + elem.y + border
    ) : elem.y + border;

  // Draw border
  g.setColor(g.theme.fg)
   .fillRect(elem.x, elem.y, elem.x + elem.w - 1, elem.y + elem.h - 1)
   // Draw scroll box area
   .setColor(g.theme.bg)
   .fillRect(elem.x + border, elem.y + border,
             elem.x + elem.w - border - 1, elem.y + elem.h - border - 1)
   // Draw scroll box
   .setColor(g.blendColor(g.theme.bg, g.theme.fg, 0.5))
   .fillRect(elem.x + border, boxTop,
             elem.x + elem.w - border - 1, boxTop + boxSize - 1);
}

// Main app screen interface, launched by calling start()
class MainScreen {

  constructor() {
    // Values set up by start()
    this.itemsPerPage = null;
    this.scrollPos = null;
    this.layout = null;

    // Handlers/listeners
    this.buttonTimeoutId = null;
    this.listeners = {};
  }

  // Launch this UI and make it live
  start() {
    this._initLayout();
    this.layout.clear();
    this.scroll('b');
    this.render('buttons');

    this._initTouch();
  }

  // Stop this UI, shut down all timers/listeners, and otherwise clean up
  stop() {
    if (this.buttonTimeoutId) {
      clearTimeout(this.buttonTimeoutId);
      this.buttonTimeoutId = null;
    }

    // Kill layout handlers
    Bangle.removeListener('drag', this.listeners.drag);
    Bangle.removeListener('touch', this.listeners.touch);
    clearWatch(this.listeners.btnWatch);
    Bangle.setUI();
  }

  _initLayout() {
    let layout = new Layout(
      {type: 'v',
       c: [
         // Placeholder to force bottom alignment when there is unused
         // vertical screen space
         {type: '', id: 'placeholder', fillx: 1, filly: 1},

         {type: 'h',
          c: [
            {type: 'v',
             id: 'logItems',

             // To be filled in with log item elements once we
             // determine how many will fit on screen
             c: [],
            },
            {type: 'custom',
             id: 'logScroll',
             render: elem => { renderScrollBar(elem, this.scrollBarInfo()); }
            },
          ],
         },
         {type: 'h',
          id: 'buttons',
          c: [
            {type: 'btn', font: '6x8:2', fillx: 1, label: '+ XX:XX', id: 'addBtn',
             cb: this.addTimestamp.bind(this)},
            {type: 'btn', font: '6x8:2', label: getIcon('menu'), id: 'menuBtn',
             cb: () => launchSettingsMenu(returnFromSettings)},
          ],
         },
       ],
      }
    );

    // Calculate how many log items per page we have space to display
    layout.update();
    let availableHeight = layout.placeholder.h;
    g.setFont(tsl.fontSpec(tsl.SETTINGS.logFont,
                       tsl.SETTINGS.logFontHSize, tsl.SETTINGS.logFontVSize));
    let logItemHeight = g.getFontHeight() * 2;
    this.itemsPerPage = Math.max(1,
                                 Math.floor(availableHeight / logItemHeight));

    // Populate log items in layout
    for (let i = 0; i < this.itemsPerPage; i++) {
      layout.logItems.c.push(
        {type: 'custom', render: renderLogItem, item: undefined, itemIdx: undefined,
         fillx: 1, height: logItemHeight}
      );
    }
    layout.logScroll.height = logItemHeight * this.itemsPerPage;
    layout.logScroll.width = SCROLL_BAR_WIDTH;
    layout.update();

    this.layout = layout;
  }

  // Redraw a particular display `item`, or everything if `item` is falsey
  render(item) {
    if (!item || item == 'log') {
      let layLogItems = this.layout.logItems;
      let logIdx = this.scrollPos - this.itemsPerPage;
      for (let elem of layLogItems.c) {
        logIdx++;
        elem.item = stampLog.log[logIdx];
        elem.itemIdx = logIdx;
      }
      this.layout.render(layLogItems);
      this.layout.render(this.layout.logScroll);
    }

    if (!item || item == 'buttons') {
      let addBtn = this.layout.addBtn;

      if (!tsl.SETTINGS.rotateLog && stampLog.isFull()) {
        // Dimmed appearance for unselectable button
        addBtn.btnFaceCol = g.blendColor(g.theme.bg2, g.theme.bg, 0.5);
        addBtn.btnBorderCol = g.blendColor(g.theme.fg2, g.theme.bg, 0.5);

        addBtn.label = 'Log full';
      } else {
        addBtn.btnFaceCol = g.theme.bg2;
        addBtn.btnBorderCol = g.theme.fg2;

        addBtn.label = getIcon('add') + ' ' + locale.time(new Date(), 1).trim();
      }

      this.layout.render(this.layout.buttons);

      // Auto-update time of day indication on log-add button upon
      // next minute
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

  _initTouch() {
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
        // Drag released
        distanceY = null;
      }
      if (Math.abs(distanceY) > DRAG_THRESHOLD) {
        // Scroll threshold reached
        Bangle.buzz(50, .5);
        this.scroll(distanceY > 0 ? 'u' : 'd');
        distanceY = null;
      }
    }

    this.listeners.drag = dragHandler.bind(this);
    Bangle.on('drag', this.listeners.drag);

    function touchHandler(button, xy) {
      // Handle taps on log entries
      let logUIItems = this.layout.logItems.c;
      for (var logUIObj of logUIItems) {
        if (!xy.type &&
            logUIObj.x <= xy.x && xy.x < logUIObj.x + logUIObj.w &&
            logUIObj.y <= xy.y && xy.y < logUIObj.y + logUIObj.h &&
            logUIObj.item) {
          switchUI(new LogEntryScreen(stampLog, logUIObj.itemIdx));
          break;
        }
      }
    }

    this.listeners.touch = touchHandler.bind(this);
    Bangle.on('touch', this.listeners.touch);

    function buttonHandler() {
      let act = tsl.SETTINGS.buttonAction;
      if (act == 'Log time') {
        if (currentUI != mainUI) {
          switchUI(mainUI);
        }
        mainUI.addTimestamp();
      } else if (act == 'Open settings') {
        launchSettingsMenu(returnFromSettings);
      } else if (act == 'Quit app') {
        Bangle.showClock();
      }
    }

    this.listeners.btnWatch = setWatch(buttonHandler, BTN,
      {edge: 'falling', debounce: 50, repeat: true});
  }

  // Add current timestamp to log if possible and update UI display
  addTimestamp() {
    if (tsl.SETTINGS.rotateLog || !stampLog.isFull()) {
      stampLog.addEntry();
      this.scroll('b');
      this.render('buttons');
    }
  }

  // Get scroll information for log display
  scrollInfo() {
    return {
      pos: this.scrollPos,
      min: (stampLog.log.length - 1) % this.itemsPerPage,
      max: stampLog.log.length - 1,
      itemsPerPage: this.itemsPerPage
    };
  }

  // Like scrollInfo, but adjust the data so as to suggest scrollbar
  // geometry that accurately reflects the nature of the scrolling
  // (page by page rather than item by item)
  scrollBarInfo() {
    const info = this.scrollInfo();

    function toPage(scrollPos) {
      return Math.floor(scrollPos / info.itemsPerPage);
    }

    return {
    // Define 1 "screenfull" as the unit here
      itemsPerPage: 1,
      pos: toPage(info.pos),
      min: toPage(info.min),
      max: toPage(info.max),
    };
  }

  // Scroll display in given direction or to given position:
  // 'u': up, 'd': down, 't': to top, 'b': to bottom
  scroll(how) {
    let scroll = this.scrollInfo();

    if (how == 'u') {
      this.scrollPos -= scroll.itemsPerPage;
    } else if (how == 'd') {
      this.scrollPos += scroll.itemsPerPage;
    } else if (how == 't') {
      this.scrollPos = scroll.min;
    } else if (how == 'b') {
      this.scrollPos = scroll.max;
    }

    this.scrollPos = E.clip(this.scrollPos, scroll.min, scroll.max);

    this.render('log');
  }
}


// Log entry screen interface, launched by calling start()
class LogEntryScreen {

  constructor(stampLog, logIdx) {
    this.logIdx = logIdx;
    this.logItem = stampLog.log[logIdx];

    this.defaultFont = tsl.fontSpec(
      tsl.SETTINGS.logFont, tsl.SETTINGS.logFontHSize, tsl.SETTINGS.logFontVSize);
  }

  start() {
    this._initLayout();
    this.layout.clear();
    this.refresh();
  }

  stop() {
    Bangle.setUI();
  }

  back() {
    this.stop();
    switchUI(mainUI);
  }

  _initLayout() {
    let layout = new Layout(
      {type: 'v',
       c: [
         {type: 'txt', font: this.defaultFont, id: 'entryno', label: 'Entry ?/?'},
         {type: 'txt', font: this.defaultFont, id: 'date', label: '?'},
         {type: 'txt', font: this.defaultFont, id: 'time', label: '?'},
         {type: '', id: 'placeholder', fillx: 1, filly: 1},
         {type: 'btn', font: '12x20', label: 'Delete',
          cb: this.delLogItem.bind(this)},
       ],
      },
      {
        back: this.back.bind(this),
        btns: [
          {label: '<', cb: this.prevLogItem.bind(this)},
          {label: '>', cb: this.nextLogItem.bind(this)},
        ],
      }
    );

    layout.update();
    this.layout = layout;
  }

  render(item) {
    this.layout.clear();
    this.layout.render();
  }

  refresh() {
    this.logItem = stampLog.log[this.logIdx];
    this.layout.entryno.label = 'Entry ' + (this.logIdx+1) + '/' + stampLog.log.length;
    this.layout.date.label = locale.date(this.logItem.stamp, 1);
    this.layout.time.label = locale.time(this.logItem.stamp).trim();
    this.layout.update();
    this.render();
  }

  prevLogItem() {
    this.logIdx = this.logIdx ? this.logIdx-1 : stampLog.log.length-1;
    this.refresh();
  }

  nextLogItem() {
    this.logIdx = this.logIdx == stampLog.log.length-1 ? 0 : this.logIdx+1;
    this.refresh();
  }

  delLogItem() {
    stampLog.deleteEntries([this.logItem]);
    if (!stampLog.log.length) {
      this.back();
      return;
    } else if (this.logIdx > stampLog.log.length - 1) {
      this.logIdx = stampLog.log.length - 1;
    }

    // Create a brief “blink” on the screen to provide user feedback
    // that the deletion has been performed
    this.layout.clear();
    setTimeout(this.refresh.bind(this), 250);
  }

}


function switchUI(newUI) {
  currentUI.stop();
  currentUI = newUI;
  currentUI.start();
}


function saveErrorAlert() {
  currentUI.stop();
  // Not `showAlert` because the icon plus message don't fit the
  // screen well
  E.showPrompt(
    'Trouble saving timestamp log; data may be lost!',
    {title: "Can't save log",
     buttons: {'Ok': true}}
  ).then(currentUI.start.bind(currentUI));
}


function launchSettingsMenu(backCb) {
  currentUI.stop();
  stampLog.save();
  tsl.launchSettingsMenu(backCb);
}

function returnFromSettings() {
  // Reload stampLog to pick up any changes made from settings UI
  stampLog = loadStampLog();
  currentUI.start();
}


function loadStampLog() {
  // Create a StampLog object with its data loaded from storage
  return new tsl.StampLog(tsl.LOG_FILENAME, tsl.SETTINGS.maxLogLength);
}


Bangle.loadWidgets();
Bangle.drawWidgets();

var stampLog = loadStampLog();
E.on('kill', stampLog.save.bind(stampLog));
stampLog.on('saveError', saveErrorAlert);

var currentUI = new MainScreen(stampLog);
var mainUI = currentUI;
currentUI.start();
