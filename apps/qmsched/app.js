Bangle.loadWidgets();
Bangle.drawWidgets();

const modeNames = ["Off", "Alarms", "Silent"];

// load global settings
let bSettings = require('Storage').readJSON('setting.json',true)||{};
let current = 0|bSettings.quiet;
delete bSettings; // we don't need any other global settings






/**
 * Save settings to qmsched.json
 */
function save() {
  require('Storage').writeJSON('qmsched.json', settings);
  eval(require('Storage').read('qmsched.boot.js')); // apply new schedules right away
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
/**
 * Apply theme
 */
function applyTheme() {
  const theme = (require("Storage").readJSON("setting.json", 1) || {}).theme;
  if (theme && theme.dark===g.theme.dark) return; // already correct
  g.theme = theme;
  delete g.reset;
  g._reset = g.reset;
  g.reset = function(n) { return g._reset().setColor(g.theme.fg).setBgColor(g.theme.bg); };
  g.clear = function(n) { if (n) g.reset(); return g.clearRect(0,0,g.getWidth(),g.getHeight()); };
  g.clear(1);
  Bangle.drawWidgets();
  delete m.lastIdx; // force redraw
  m.draw();
}

/**
 * Library uses this to make the app update itself
 * @param {int} mode New Quite Mode
 */
function setAppQuietMode(mode) {
  if (mode === current) return;
  current = mode;
  delete m.lastIdx; // force redraw
  applyTheme();
  if (m.lastIdx===undefined) m.draw(); // applyTheme didn't redraw menu, but we need to show updated mode
}

let m;
function showMainMenu() {
  let menu = {
    "": {"title": "Quiet Mode"},
    "< Exit": () => load()
  };
  // "Current Mode""Silent" won't fit on Bangle.js 2
  menu["Current"+((process.env.HWVERSION===2) ? "" : " Mode")] = {
    value: current,
    min:0, max:2, wrap: true,
    format: () => modeNames[current],
    onchange: require("qmsched").setMode, // library calls setAppMode(), which updates `current`
  };
  scheds.sort((a, b) => (a.hr-b.hr));
  scheds.forEach((sched, idx) => {
    menu[formatTime(sched.hr)] = {
      format: () => modeNames[sched.mode], // abuse format to right-align text
      onchange: () => {
        m.draw = ()=> {}; // prevent redraw of main menu over edit menu (needed because we abuse format/onchange)
        showEditMenu(idx);
      }
    };
  });
  menu["Add Schedule"] = () => showEditMenu(-1);
  menu["Switch Theme"] = {
    value: !!get("switchTheme"),
    format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
    onchange: v => v ? set("switchTheme", v) : unset("switchTheme"),
  };
  menu["LCD Settings"] = () => showOptionsMenu();
  m = E.showMenu(menu);
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
      min:0, max:23, wrap:true,
      onchange: v => {hrs = v;},
    },
    "Minutes": {
      value: mins,
      min:0, max:55, step:5, wrap:true,
      onchange: v => {mins = v;},
    },
    "Switch to": {
      value: mode,
      min:0, max:2, wrap:true,
      format: v => modeNames[v],
      onchange: v => {mode = v;},
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
  m = E.showMenu(menu);
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
  m = E.showMenu(oMenu);
}

loadSettings();
showMainMenu();
