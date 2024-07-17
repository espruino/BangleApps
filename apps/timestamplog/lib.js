const storage = require('Storage');

// Storage filenames

const LOG_FILENAME = 'timestamplog.json';
const SETTINGS_FILENAME = 'timestamplog.settings.json';


// Settings

const SETTINGS = Object.assign({
  logFont: '12x20',
  logFontHSize: 1,
  logFontVSize: 1,
  maxLogLength: 30,
  rotateLog: false,
  buttonAction: 'Log time',
}, storage.readJSON(SETTINGS_FILENAME, true) || {});

const SETTINGS_BUTTON_ACTION = [
  'Log time',
  'Open settings',
  'Quit app',
  'Do nothing',
];


function fontSpec(name, hsize, vsize) {
  return name + ':' + hsize + 'x' + vsize;
}


//// Data models ////

// High-level timestamp log object that provides an interface to the
// UI for managing log entries and automatically loading/saving
// changes to flash storage.
class StampLog {
  constructor(filename, maxLength) {
    // Name of file to save log to
    this.filename = filename;
    // Maximum entries for log before old entries are overwritten with
    // newer ones
    this.maxLength = maxLength;

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
    this.log = [];

    this.load();
  }

  // Read in the log data that is currently in storage
  load() {
    let log = storage.readJSON(this.filename, true);
    if (!log) log = [];
    // Convert stringified datetimes back into Date objects
    for (let logEntry of log) {
      logEntry.stamp = new Date(logEntry.stamp);
    }
    this.log = log;
  }

  // Write current log data to storage if anything needs to be saved
  save() {
    // Cancel any pending scheduled calls to save()
    if (this.saveId) {
      clearTimeout(this.saveId);
      this.saveId = null;
    }

    if (this.isDirty) {
      let logToSave = [];
      for (let logEntry of this.log) {
        // Serialize each Date object into an ISO string before saving
        let newEntry = Object.assign({}, logEntry);
        newEntry.stamp = logEntry.stamp.toISOString();
        logToSave.push(newEntry);
      }

      if (storage.writeJSON(this.filename, logToSave)) {
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
    // If log full, purge an old entry to make room for new one
    if (this.maxLength) {
      while (this.log.length + 1 > this.maxLength) {
        this.log.shift();
      }
    }
    // Add new entry
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

  // Does the log currently contain the maximum possible number of entries?
  isFull() {
    return this.log.length >= this.maxLength;
  }
}

function launchSettingsMenu(backCb) {
  const fonts = g.getFonts();
  const stampLog = new StampLog(LOG_FILENAME, SETTINGS.maxLogLength);

  function saveSettings() {
    console.log('Saving timestamp log and settings');
    stampLog.save();
    if (!storage.writeJSON(SETTINGS_FILENAME, SETTINGS)) {
      E.showAlert('Trouble saving settings');
    }
  }
  E.on('kill', saveSettings);

  function endMenu() {
    saveSettings();
    E.removeListener('kill', saveSettings);
    backCb();
  }

  function topMenu() {
    E.showMenu({
      '': {
        title: 'Stamplog',
        back: endMenu,
      },
      'Log': logMenu,
      'Appearance': appearanceMenu,
      'Button': {
        value: SETTINGS_BUTTON_ACTION.indexOf(SETTINGS.buttonAction),
        min: 0, max: SETTINGS_BUTTON_ACTION.length - 1,
        format: v => SETTINGS_BUTTON_ACTION[v],
        onchange: v => {
          SETTINGS.buttonAction = SETTINGS_BUTTON_ACTION[v];
        },
      },
    });
  }

  function logMenu() {
    E.showMenu({
      '': {
        title: 'Log',
        back: topMenu,
      },
      'Max entries': {
        value: SETTINGS.maxLogLength,
        min: 5, max: 100, step: 5,
        onchange: v => {
          SETTINGS.maxLogLength = v;
          stampLog.maxLength = v;
        }
      },
      'Auto-delete oldest': {
        value: SETTINGS.rotateLog,
        onchange: v => {
          SETTINGS.rotateLog = !SETTINGS.rotateLog;
        }
      },
      'Clear log': doClearLog,
    });
  }

  function appearanceMenu() {
    E.showMenu({
      '': {
        title: 'Appearance',
        back: topMenu,
      },
      'Log font': {
        value: fonts.indexOf(SETTINGS.logFont),
        min: 0, max: fonts.length - 1,
        format: v => fonts[v],
        onchange: v => {
          SETTINGS.logFont = fonts[v];
        },
      },
      'Log font H size': {
        value: SETTINGS.logFontHSize,
        min: 1, max: 50,
        onchange: v => {
          SETTINGS.logFontHSize = v;
        },
      },
      'Log font V size': {
        value: SETTINGS.logFontVSize,
        min: 1, max: 50,
        onchange: v => {
          SETTINGS.logFontVSize = v;
        },
      },
    });
  }

  function doClearLog() {
    E.showPrompt('Erase ALL log entries?', {
      title: 'Clear log',
      buttons: {'Erase':1, "Don't":0}
    }).then((yes) => {
      if (yes) {
        stampLog.deleteEntries(stampLog.log);
      }
      logMenu();
    });
  }

  topMenu();
}

exports = {LOG_FILENAME, SETTINGS_FILENAME, SETTINGS, SETTINGS_BUTTON_ACTION, fontSpec, StampLog,
           launchSettingsMenu};
