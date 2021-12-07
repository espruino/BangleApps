Bangle.loadWidgets();
Bangle.drawWidgets();

const modeNames = ["Off", "Alarms", "Silent"];

// load global brightness setting
let bSettings = require('Storage').readJSON('setting.json',true)||{};
let current = 0|bSettings.quiet;
delete bSettings; // we don't need any other global settings






/**
 * Save settings to qmsched.json
 */
function save() {
  require('Storage').writeJSON('qmsched.json', settings);
}
function get(key, def) {
  return (key in settings) ? settings[key] : def;
}
function set(key, val) {
  settings[key] = val; save();
  scheds = settings.scheds; options = settings.options; // update references
}
function unset(key) {
  delete settings[key]; save();
}

let settings,
  scheds, options; // references for convenience
/**
 * Load settings file, check if we need to migrate old setting formats to new
 */
function loadSettings() {
  settings = require('Storage').readJSON("qmsched.json", true) || {};

  if (Array.isArray(settings)) {
    // migrate old file (plain array of schedules, qmOptions stored in global settings file)
    require("Storage").erase("qmsched.json"); // need to erase old file, or Things Break, somehow...
    let bOptions = require('Storage').readJSON('setting.json',true)||{};
    settings = {
      options: bOptions.qmOptions || {},
      scheds: settings,
    };
    // store new format
    save();
    // and clean up qmOptions from global settings file
    delete bOptions.qmOptions;
    require('Storage').writeJSON('setting.json',bOptions);
  }
  // apply defaults
  settings = Object.assign({
    options: {}, // Bangle options to override during quiet mode, default = none
    scheds: [
      // default schedule:
      {"hr":  8, "mode": 0},
      {"hr": 22, "mode": 1},
    ],
  }, settings);
  scheds = settings.scheds; options = settings.options;

  if (scheds.length && scheds.some(s => "last" in s)) {
    // cleanup: remove "last" values (used by older versions)
    set('scheds', scheds.map(s => {
      delete s.last;
      return s;
    }));
  }
}

function formatTime(t) {
  const hrs = 0|t;
  const mins = Math.round((t-hrs)*60);
  return (" "+hrs).substr(-2)+":"+("0"+mins).substr(-2);
}

function showMainMenu() {
  let _m, menu = {
    "": {"title": "Quiet Mode"},
    "< Exit": () => load()
  };
  // "Current Mode""Silent" won't fit on Bangle.js 2
  menu["Current"+((process.env.HWVERSION===2) ? "" : " Mode")] = {
    value: current,
    format: v => modeNames[v],
    onchange: function(v) {
      if (v<0) {v = 2;}
      if (v>2) {v = 0;}
      require("qmsched").setMode(v);
      current = v;
      this.value = v;
    },
  };
  scheds.sort((a, b) => (a.hr-b.hr));
  scheds.forEach((sched, idx) => {
    menu[formatTime(sched.hr)] = {
      format: () => modeNames[sched.mode], // abuse format to right-align text
      onchange: function() {
        _m.draw = ()=> {}; // prevent redraw of main menu over edit menu
        showEditMenu(idx);
      }
    };
  });
  menu["Add Schedule"] = () => showEditMenu(-1);
  menu["LCD Settings"] = () => showOptionsMenu();
  _m = E.showMenu(menu);
}

function showEditMenu(index) {
  const isNew = index<0;
  let hrs = 12, mins = 0;
  let mode = 1;
  if (!isNew) {
    const s = scheds[index];
    hrs = 0|s.hr;
    mins = Math.round((s.hr-hrs)*60);
    mode = s.mode;
  }
  const menu = {
    "": {"title": (isNew ? "Add" : "Edit")+" Schedule"},
    "< Cancel": () => showMainMenu(),
    "Hours": {
      value: hrs,
      onchange: function(v) {
        if (v<0) {v = 23;}
        if (v>23) {v = 0;}
        hrs = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    "Minutes": {
      value: mins,
      onchange: function(v) {
        if (v<0) {v = 59;}
        if (v>59) {v = 0;}
        mins = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    "Switch to": {
      value: mode,
      format: v => modeNames[v],
      onchange: function(v) {
        if (v<0) {v = 2;}
        if (v>2) {v = 0;}
        mode = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
  };
  function getSched() {
    return {
      hr: hrs+(mins/60),
      mode: mode,
    };
  }
  menu["> Save"] = function() {
    if (isNew) {
      scheds.push(getSched());
    } else {
      scheds[index] = getSched();
    }
    save();
    showMainMenu();
  };
  if (!isNew) {
    menu["> Delete"] = function() {
      scheds.splice(index, 1);
      save();
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

function showOptionsMenu() {
  const disabledFormat = v => v ? "Off" : "-";
  function toggle(option) {
    // we disable wakeOn* events by setting them to `false` in options
    // not disabled = not present in options at all
    if (option in options) {
      delete options[option];
    } else {
      options[option] = false;
    }
    save();
  }
  let resetTimeout;
  const oMenu = {
    "": {"title": "LCD Settings"},
    "< Back": () => showMainMenu(),
    "LCD Brightness": {
      value: get("brightness", 0),
      min: 0, // 0 = use default
      max: 1,
      step: 0.1,
      format: v => (v>0.05) ? v : "-",
      onchange: v => {
        if (v>0.05) { // prevent v=0.000000000000001 bugs
          set("brightness", v);
          Bangle.setLCDBrightness(v);  // show result, even if not quiet right now
          // restore brightness after half a second
          if (resetTimeout) clearTimeout(resetTimeout);
          resetTimeout = setTimeout(() => {
            resetTimeout = undefined;
            require("qmsched").setMode(current);
          }, 500);
        } else {
          unset("brightness");
          require("qmsched").setMode(current);
        }
      },
    },
    "LCD Timeout": {
      value: get("timeout", 0),
      min: 0, // 0 = use default  (no constant on for quiet mode)
      max: 60,
      step: 5,
      format: v => v>1 ? v : "-",
      onchange: v => {
        if (v>1) set("timeout", v);
        else unset("timeout");
      },
    },
    // we disable wakeOn* events by overwriting them as false in options
    // not disabled = not present in options at all
    "Wake on FaceUp": {
      value: "wakeOnFaceUp" in options,
      format: disabledFormat,
      onchange: () => {toggle("wakeOnFaceUp");},
    },
    "Wake on Touch": {
      value: "wakeOnTouch" in options,
      format: disabledFormat,
      onchange: () => {toggle("wakeOnTouch");},
    },
    "Wake on Twist": {
      value: "wakeOnTwist" in options,
      format: disabledFormat,
      onchange: () => {toggle("wakeOnTwist");},
    },
  };
  return E.showMenu(oMenu);
}

loadSettings();
showMainMenu();
