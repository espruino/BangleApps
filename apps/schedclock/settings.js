(function(back) {
  /**
   * @typedef {Object} ScheduleItemType - Individual Schedule Item
   * @property {number} hour - Hour (0-23)
   * @property {number} minute - Minute (0-59)
   * @property {Array<string>} faces - Clock face source files (e.g. ["myclock.js", "otherclock.js"])
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
      const faces = item.faces || (item.face ? [item.face] : []);
      const faceName = faces.length > 1
        ? `${faces.length} ${/*LANG*/"faces"}` // multiple faces
        : (faces.length === 1
          ? (clockFaces.find(f => f.src === faces[0]) || {name: /*LANG*/"Unknown"}).name // single face
          : /*LANG*/"Unknown"); // no faces
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
   * Function to edit clock face selection for a schedule item
   * @param {Object} currentItem The schedule item being edited
   * @param {Array} clockFaces Array of available clock faces
   * @param {Object} parentMenu The parent menu to return to
   */
  const editClockFaceSelection = function(currentItem, clockFaces, parentMenu) {
    const menu = {
      "": { "title": /*LANG*/"Select Clock Faces" },
      "< Back": () => E.showMenu(parentMenu),
    };

    // Add checkbox for each clock face
    clockFaces.forEach(face => {
      const isSelected = currentItem.faces.includes(face.src);
      menu[face.name] = {
        value: isSelected,
        onchange: v => {
          if (v) {
            // Add to selection if not already present
            if (!currentItem.faces.includes(face.src)) {
              currentItem.faces.push(face.src);
            }
          } else {
            // Remove from selection
            const idx = currentItem.faces.indexOf(face.src);
            if (idx !== -1) {
              currentItem.faces.splice(idx, 1);
            }
          }
        }
      };
    });

    E.showMenu(menu);
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
      { hour: 8, minute: 0, faces: [defaultFaceSrc], dow: BIN_EVERY_DAY } :
      Object.assign({}, settings.sched[index]);

    // Handle backwards compatibility: convert single 'face' to 'faces' array
    if (currentItem.face && !currentItem.faces) {
      currentItem.faces = [currentItem.face];
      delete currentItem.face;
    }
    if (!currentItem.faces) currentItem.faces = [];

    // Default invalid items to "Every Day"
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
          const meridian = require("locale").meridian(new Date(1999, 1, 1, v, 0, 0));
          return (!meridian) ? v : (v%12||12) + meridian;
        },
        onchange: v => { currentItem.hour = v; }
      },
      /*LANG*/"Minute": {
        value: currentItem.minute,
        min: 0,
        max: 59,
        onchange: v => { currentItem.minute = v; }
      },
      /*LANG*/"Clock Faces": () => editClockFaceSelection(currentItem, clockFaces, menu),
      /*LANG*/"Save": () => {

        // Check for schedule conflicts with duplicate times and overlapping days
        const hasScheduleConflict = settings.sched.some((item, i) => {
          if (!isNew && i === index) return false; // Don't check against self when editing

          const timesMatch = item.hour === currentItem.hour 
                          && item.minute === currentItem.minute;
          if (!timesMatch) return false;

          // If times match, check for a day conflict.
          return (item.dow & currentItem.dow) !== 0;
        });

        if (hasScheduleConflict) {
          E.showAlert(
            /*LANG*/"An entry for this time already exists.",
            /*LANG*/"Time conflict"
          ).then(
            ()=>E.showMenu(menu)
          );
          return; // Prevent saving
        }

        // Ensure at least one face is selected before saving
        if (!Array.isArray(currentItem.faces) || currentItem.faces.length === 0) {
          E.showAlert(
            /*LANG*/"Select at least one clock face.",
            /*LANG*/"No faces"
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
