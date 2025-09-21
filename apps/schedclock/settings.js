(function(back) {
  /**
   * @typedef ScheduleItemType - Individual Schedule Item
   * @member {number} hour - Hour (0-23)
   * @member {number} minute - Minute (0-59)
   * @member {string} face - Clock face source file (e.g. "myclock.js")
   * @member {number} dow - Bitmask for days of week [see Sched documentation]
   * 
   * @typedef SettingsType - Overall Settings File/Object
   * @member {boolean} enabled - Whether this app is enabled
   * @member {Array<ScheduleItemType>} sched - Array of schedule items
   *
   */

  const SETTINGS_FILE = "schedclock.settings.json";
  const daysOfWeek = require("date_utils").dows(1).concat([/*LANG*/"Every Day", /*LANG*/"Weekdays", /*LANG*/"Weekends"]);
  // Bitmasks for special day selection for sched.json 
  const BIN_WORKDAYS = 0b0111110; // 62 - MTWTF
  const BIN_WEEKEND = 0b1000001; // 65 - SuSa
  const BIN_EVERY_DAY = 0b1111111; // 127 - SuMTWTFSa
  // Indexes in daysOfWeek for special day selection
  const IND_EVERY_DAY = 7;
  const IND_WORKDAYS = 8; 
  const IND_WEEKEND = 9;

  /**
   * Function to load settings
   * @returns {SettingsType} settings object
   */
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

  /**
   * Function to save settings
   * @param {SettingsType} settings 
   */
  const saveSettings = function(settings) {
    require("Storage").writeJSON(SETTINGS_FILE, settings);
    // After saving, tell the library to sync the alarms
    if (require("Storage").read("schedclock.lib.js")) {
      require("schedclock.lib.js").syncAlarms();
    }
  };

  /** 
   * Get a list of all installed clock faces
   * @returns {Array<{name:string,sortorder:number,src:string}>} array of clock face info 
   **/ 
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

  /**
   * Show the main menu
   */
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
      const dayName = daysOfWeek[dow === undefined ? IND_EVERY_DAY : dow];
      const timeStr = ("0"+item.hour).slice(-2) + ":" + ("0"+item.minute).slice(-2);
      menu[`${dayName} ${timeStr} - ${faceName}`] = () => editScheduleItem(index);
    });

    menu[/*LANG*/"Add New"] = () => editScheduleItem(-1);

    E.showMenu(menu);
  };

  /**
   * Get the bitmask for a day of week selection from an index in daysOfWeek
   * @param {number} index index in daysOfWeek
   * @returns bitmask for day of week
   */
  const dowToBinary = function(index) {
    switch(index) {
      case IND_EVERY_DAY: return BIN_EVERY_DAY;
      case IND_WORKDAYS:  return BIN_WORKDAYS;
      case IND_WEEKEND:   return BIN_WEEKEND;
      default:
        return 1 << index; // Single day (0=Sun, 1=Mon, ..., 6=Sat)
    }
  }

  /**
   * Get the index in daysOfWeek from a binary day-of-week bitmask
   * @param {number} b binary number for day of week
   * @returns index in daysOfWeek
   */
  const binaryToDow = function(b) {
    switch(b) {
      case BIN_EVERY_DAY: return IND_EVERY_DAY;
      case BIN_WORKDAYS:  return IND_WORKDAYS;
      case BIN_WEEKEND:   return IND_WEEKEND;
    }
    // Check each single day (0=Sun, 1=Mon, ..., 6=Sat)
    for (let i = 0; i < 7; i++) {
      if (b === (1 << i)) return i;
    }
    // Bitmask was something we don't handle yet, default to everyday for now
    return IND_EVERY_DAY;
  }

  /**
   * Function to edit a schedule item (or add a new one if index is -1)
   * @param {number} index index of item to edit, or -1 to add a new item
   */
  const editScheduleItem = function(index) {
    const settings = loadSettings();
    const clockFaces = getClockFaces();
    const isNew = index === -1;
    const defaultFaceSrc = clockFaces.length > 0 ? clockFaces[0].src : "";

    const currentItem = isNew ?
      { hour: 8, minute: 0, face: defaultFaceSrc, dow: BIN_EVERY_DAY } :
      Object.assign({}, settings.sched[index]);

    // Default odd items to "Every Day"
    if (currentItem.dow === undefined) currentItem.dow = BIN_EVERY_DAY;

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
          return (item.dow & currentItem.dow) !== 0;
        });

        if (validationError) {
          E.showAlert(
            /*LANG*/"Time conflict", 
            /*LANG*/"An entry for this time already exists."
          ).then(
            // Note: not sure if this is the best way to return to the menu
            ()=>E.showMenu(menu)
          );
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
