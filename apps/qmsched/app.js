Bangle.loadWidgets();
Bangle.drawWidgets();

const modeNames = [/*LANG*/"Off", /*LANG*/"Alarms", /*LANG*/"Silent"];
const B2 = process.env.HWVERSION===2;
// load global settings
const STORAGE = require('Storage');
let bSettings = STORAGE.readJSON('setting.json',true)||{};
let current = 0|bSettings.quiet;
delete bSettings; // we don't need any other global settings






/**
 * Save settings to qmsched.json
 */
function save() {
  STORAGE.writeJSON('qmsched.json', settings);
  eval(STORAGE.read('qmsched.boot.js')); // apply new schedules right away
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
  settings = STORAGE.readJSON("qmsched.json", true) || {};

  if (Array.isArray(settings)) {
    // migrate old file (plain array of schedules, qmOptions stored in global settings file)
    STORAGE.erase("qmsched.json"); // need to erase old file, or Things Break, somehow...
    let bOptions = STORAGE.readJSON('setting.json',true)||{};
    settings = {
      options: bOptions.qmOptions || {},
      scheds: settings,
    };
    // store new format
    save();
    // and clean up qmOptions from global settings file
    delete bOptions.qmOptions;
    STORAGE.writeJSON('setting.json',bOptions);
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
  const theme = (STORAGE.readJSON("setting.json", 1) || {}).theme;
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
 * This creates menu entries for setting themes. This code is lifted from the setting app.
 * @returns 
 */
function showThemeMenu(back, quiet){
  const option = quiet ? "quietTheme" : "normalTheme";
  function cl(x) { return g.setColor(x).getColor(); }
  var themesMenu = {
    '':{title:/*LANG*/'Theme', back: back},
    /*LANG*/'Default': ()=>{
      unset(option);
      back();
    }
  };

  STORAGE.list(/^.*\.theme$/).forEach(
    n => {
      let newTheme = STORAGE.readJSON(n);
      themesMenu[newTheme.name ? newTheme.name : n] = () => {
        set(option, n);
        back();
      };
    }
  );
  E.showMenu(themesMenu);
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
  let menu = {"": {"title": /*LANG*/"Quiet Mode"}};
  menu[B2 ? "< Back" : /*LANG*/"< Exit"] = () => {load();};
  menu[/*LANG*/"Current Mode"] = {
    value: current,
    min:0, max:2, wrap: true,
    format: v => modeNames[v],
    onchange: require("qmsched").setMode, // library calls setAppMode(), which updates `current`
  };
  scheds.sort((a, b) => (a.hr-b.hr));
  scheds.forEach((sched, idx) => {
    menu[formatTime(sched.hr)] = () => { showEditMenu(idx); };
    menu[formatTime(sched.hr)].format = () => modeNames[sched.mode]+' >'; // this does nothing :-(
  });
  menu[/*LANG*/"Add Schedule"] = () => showEditMenu(-1);
  menu[/*LANG*/"Switch Theme"] = {
    value: !!get("switchTheme"),
    onchange: v => v ? set("switchTheme", v) : unset("switchTheme"),
  };
  menu[/*LANG*/"Options"] = () => showOptionsMenu();
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
  let menu = {"": {"title": (isNew ? /*LANG*/"Add Schedule" : /*LANG*/"Edit Schedule")}};
  menu[B2 ? "< Back" : /*LANG*/"< Cancel"] =  () => showMainMenu();
  menu[/*LANG*/"Hours"] = {
    value: hrs,
    min:0, max:23, wrap:true,
    onchange: v => {hrs = v;},
  };
  menu[/*LANG*/"Minutes"] = {
    value: mins,
    min:0, max:55, step:5, wrap:true,
    onchange: v => {mins = v;},
  };
  menu[/*LANG*/"Switch to"] = {
    value: mode,
    min:0, max:2, wrap:true,
    format: v => modeNames[v],
    onchange: v => {mode = v;},
  };
  function getSched() {
    return {
      hr: hrs+(mins/60),
      mode: mode,
    };
  }
  menu[B2 ? /*LANG*/"Save" : /*LANG*/"> Save"] = function() {
    if (isNew) {
      scheds.push(getSched());
    } else {
      scheds[index] = getSched();
    }
    save();
    showMainMenu();
  };
  if (!isNew) {
    menu[B2 ? /*LANG*/"Delete" : /*LANG*/"> Delete"] = function() {
      scheds.splice(index, 1);
      save();
      showMainMenu();
    };
  }
  m = E.showMenu(menu);
}

function showOptionsMenu() {
  const disabledFormat = v => v ? /*LANG*/"Off" : "-";
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
    "": {"title": /*LANG*/"LCD Settings"},
    "< Back": () => showMainMenu(),
    /*LANG*/"LCD Brightness": {
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
    /*LANG*/"LCD Timeout": {
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
    /*LANG*/"Wake on FaceUp": {
      value: "wakeOnFaceUp" in options,
      format: disabledFormat,
      onchange: () => {toggle("wakeOnFaceUp");},
    },
    /*LANG*/"Wake on Touch": {
      value: "wakeOnTouch" in options,
      format: disabledFormat,
      onchange: () => {toggle("wakeOnTouch");},
    },
    /*LANG*/"Wake on Twist": {
      value: "wakeOnTwist" in options,
      format: disabledFormat,
      onchange: () => {toggle("wakeOnTwist");},
    },
  };

  oMenu[/*LANG*/"Normal Theme"] = () => showThemeMenu(showOptionsMenu, false);
  oMenu[/*LANG*/"Quiet Theme"] = () => showThemeMenu(showOptionsMenu, true);

  m = E.showMenu(oMenu);
}

loadSettings();
showMainMenu();
