(function(back) {
  /**
   * @typedef {Object} ScheduleItemType - Individual Schedule Item
   * @property {number} hour - Hour (0-23)
   * @property {number} minute - Minute (0-59)
   * @property {string} face - Clock face source file (e.g. "myclock.js")
   * @property {number} dow - Bitmask for days of week [see Sched documentation]
   * 
   * @typedef {Object} SettingsType - Overall Settings File/Object
   * @property {boolean} enabled - Whether this app is enabled
   * @property {Array<ScheduleItemType>} sched - Array of schedule items
   */

  const SETTINGS_FILE = "schedclock.settings.json";
  // Bitmasks for special day selection for sched.json 
  const BIN_WORKDAYS = 0b0111110; // 62 - MTWTF
  const BIN_WEEKEND = 0b1000001; // 65 - SuSa
  const BIN_EVERY_DAY = 0b1111111; // 127 - SuMTWTFSa
  // Indexes in daysOfWeek for special day selection
  const IND_EVERY_DAY = 7;
  const IND_WORKDAYS = 8; 
  const IND_WEEKEND = 9;

  // dows(0) = days of week starting at Sunday
  const daysOfWeek = require("date_utils").dows(0).concat([/*LANG*/"Every Day", /*LANG*/"Weekdays", /*LANG*/"Weekends"]);

  /**
   * Function to load settings
   * @returns {SettingsType} settings object
   */
  const loadSettings = function() {
    const settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {};
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
    require("schedclock.lib.js").syncAlarms();
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
      const dow = bitmaskToDowIndex(item.dow);
      const dayName = daysOfWeek[dow === undefined ? IND_EVERY_DAY : dow];
      const timeStr = require("locale").time(new Date(1999, 1, 1, item.hour, item.minute, 0),1)
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
  const dowIndexToBitmask = function(index) {
    switch(index) {
      case IND_EVERY_DAY: return BIN_EVERY_DAY;
      case IND_WORKDAYS:  return BIN_WORKDAYS;
      case IND_WEEKEND:   return BIN_WEEKEND;
      default:
        return 1 << index; // Bitmask: Sun=1, Mon=2, Tue=4, Wed=8, Thu=16, Fri=32, Sat=64
    }
  };

  /**
   * Get the index in daysOfWeek from a binary day-of-week bitmask
   * @param {number} b binary number for day of week
   * @returns index in daysOfWeek
   */
  const bitmaskToDowIndex = function(b) {
    switch(b) {
      case 1: return 0;
      case 2: return 1;
      case 4: return 2;
      case 8: return 3;
      case 16: return 4;
      case 32: return 5;
      case 64: return 6;
      case BIN_WORKDAYS:  return IND_WORKDAYS;
      case BIN_WEEKEND:   return IND_WEEKEND;
      case BIN_EVERY_DAY:          
      default: return IND_EVERY_DAY;
    }
  };

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

    let dow = bitmaskToDowIndex(currentItem.dow);

    const menu = {
      "": { "title": isNew ? /*LANG*/"Add Schedule" : /*LANG*/"Edit Schedule" },
      "< Back": () => showMainMenu(),
      /*LANG*/"Day": {
        value: dow,
        min: 0,
        max: daysOfWeek.length - 1,
        format: v => daysOfWeek[v],
        onchange: v => { 
          currentItem.dow = dowIndexToBitmask(v); 
        },
      },
      /*LANG*/"Hour": {
        value: currentItem.hour,
        min: 0,
        max: 23,
        format: v => {
          // Format as 12h time if user has that set
          const meridean = require("locale").meridian(new Date(1999, 1, 1, v, 0, 0),1);
          return (!meridean) ? v : (v%12||12) + meridean;
        },
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
            /*LANG*/"An entry for this time already exists.",
            /*LANG*/"Time conflict"
          ).then(
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
