(function(back) {
  const SETTINGS_FILE = "schedclock.settings.json";
  const daysOfWeek = require("date_utils").dows(1).concat([/*LANG*/"Every Day", /*LANG*/"Weekdays", /*LANG*/"Weekends"]);
  const WORKDAYS = 0b0111110; // 62 - MTWTF
  const WEEKEND = 0b1000001; // 65 - SuSa
  const EVERY_DAY = 0b1111111; // 127 - SuMTWTFSa

  // Function to load settings
  const loadSettings = function() {
    let settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {};
    settings.enabled = !!settings.enabled;
    if (!Array.isArray(settings.sched)) settings.sched = [];

    // Sort by time
    settings.sched.sort((a, b) => {
      return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute);
    });
    return settings;
  };

  // Function to save settings
  const saveSettings = function(settings) {
    require("Storage").writeJSON(SETTINGS_FILE, settings);
    // After saving, tell the library to sync the alarms
    if (require("Storage").read("schedclock.lib.js")) {
      require("schedclock.lib.js").syncAlarms();
    }
  };

  // Get a list of all installed clock faces
  const getClockFaces = function() {
    return require("Storage").list(/\.info$/).map(file => {
      const info = require("Storage").readJSON(file, 1) || {};
      if (info && info.type === "clock" && info.src) {
        return {
          name: info.name || info.src.replace(".js",""),
          sortorder: info.sortorder || 0,
          src: info.src
        };
      }
    })
    .filter(f => f) // Remove any invalid entries
    .sort((a, b) => { // Sort by sortorder, then name (from clkshortcuts)
      var n = (0 | a.sortorder) - (0 | b.sortorder);
      if (n) return n;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  };

  // Show the main menu
  const showMainMenu = function() {
    const settings = loadSettings();
    const clockFaces = getClockFaces();
    const menu = {
      "": { "title": /*LANG*/"Schedule Clock" },
      "< Back": () => back(),
      /*LANG*/"Enabled": {
        value: settings.enabled,
        onchange: v => {
          settings.enabled = v;
          saveSettings(settings);
        }
      },
    };

    // Add existing schedule items to the menu
    settings.sched.forEach((item, index) => {
      const faceName = (clockFaces.find(f => f.src === item.face) || {name: /*LANG*/"Unknown"}).name;
      const dow = binaryToDow(item.dow);
      const dayName = daysOfWeek[dow === undefined ? 7 : dow];
      const timeStr = ("0"+item.hour).slice(-2) + ":" + ("0"+item.minute).slice(-2);
      menu[`${dayName} ${timeStr} - ${faceName}`] = () => editScheduleItem(index);
    });

    menu[/*LANG*/"Add New"] = () => editScheduleItem(-1);

    E.showMenu(menu);
  };

  const dowToBinary = function(v) {
    // v is the index in daysOfWeek
    switch(v) {
      case 7: return EVERY_DAY; // Every Day
      case 8: return WORKDAYS; // Weekdays
      case 9: return WEEKEND; // Weekends
      default:
        return 1 << v; // Single day (0=Sun, 1=Mon, ..., 6=Sat)
    }
  }

  const binaryToDow = function(b) {
    // b is the bitmask
    switch(b) {
      case EVERY_DAY: return 7; // Every Day
      case WORKDAYS: return 8; // Weekdays
      case WEEKEND: return 9; // Weekends
    }
    for (let i = 0; i < 7; i++) {
      if (b === (1 << i)) return i; // Single day (0=Sun, 1=Mon, ..., 6=Sat)
    }
    return 7;
  }

  // Function to edit a schedule item (or add a new one if index is -1)
  const editScheduleItem = function(index) {
    const settings = loadSettings();
    const clockFaces = getClockFaces();
    const isNew = index === -1;
    const defaultFaceSrc = clockFaces.length > 0 ? clockFaces[0].src : "";

    const currentItem = isNew ?
      { hour: 8, minute: 0, face: defaultFaceSrc, dow: EVERY_DAY } :
      Object.assign({}, settings.sched[index]);

    // Default odd items to "Every Day"
    if (currentItem.dow === undefined) currentItem.dow = EVERY_DAY;

    let dow = binaryToDow(currentItem.dow);

    const menu = {
      "": { "title": isNew ? /*LANG*/"Add Schedule" : /*LANG*/"Edit Schedule" },
      "< Back": () => showMainMenu(),
      /*LANG*/"Day": {
        value: dow,
        min: 0,
        max: daysOfWeek.length - 1,
        format: v => daysOfWeek[v],
        onchange: v => { 
          currentItem.dow = dowToBinary(v); 
        },
      },
      /*LANG*/"Hour": {
        value: currentItem.hour,
        min: 0,
        max: 23,
        onchange: v => { currentItem.hour = v; }
      },
      /*LANG*/"Minute": {
        value: currentItem.minute,
        min: 0,
        max: 59,
        onchange: v => { currentItem.minute = v; }
      },
      /*LANG*/"Clock Face": {
        value: Math.max(0, clockFaces.findIndex(f => f.src === currentItem.face)),
        min: 0,
        max: clockFaces.length - 1,
        format: v => (clockFaces[v] && clockFaces[v].name) || /*LANG*/"None",
        onchange: v => {
          if (clockFaces[v]) currentItem.face = clockFaces[v].src;
        }
      },
      /*LANG*/"Save": () => {
        const validationError = settings.sched.some((item, i) => {
          if (!isNew && i === index) return false; // Don't check against self when editing

          const timesMatch = item.hour === currentItem.hour 
                          && item.minute === currentItem.minute;
          if (!timesMatch) return false;

          // If times match, check for a day conflict.
          return item.dow & currentItem.dow !== 0;
        });

        if (validationError) {
          E.showAlert(/*LANG*/"Time conflict", /*LANG*/"An entry for this time already exists.")
          .then(()=>E.showMenu(menu));
          return; // Prevent saving
        }

        if (isNew) {
          settings.sched.push(currentItem);
        } else {
          settings.sched[index] = currentItem;
        }
        saveSettings(settings);
        showMainMenu();
      }
    };

    if (!isNew) {
      menu[/*LANG*/"Delete"] = () => {
        E.showPrompt(/*LANG*/"Delete this item?").then(confirm => {
          if (confirm) {
            settings.sched.splice(index, 1);
            saveSettings(settings);
          }
          showMainMenu();
        });
      };
    }

    E.showMenu(menu);
  };

  Bangle.loadWidgets();
  Bangle.drawWidgets();
  showMainMenu();
})
