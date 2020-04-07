Bangle.loadWidgets();
Bangle.drawWidgets();

const storage = require('Storage');
let settings;

function updateSettings() {
  //storage.erase('setting.json'); // - not needed, just causes extra writes if settings were the same
  storage.write('setting.json', settings);
}

function updateOptions() {
  updateSettings();
  Bangle.setOptions(settings.options)
}

function gToInternal(g) {
  // converts g to Espruino internal unit
  return g * 8192;
}

function internalToG(u) {
  // converts Espruino internal unit to g
  return u / 8192
}

function resetSettings() {
  settings = {
    ble: true,             // Bluetooth enabled by default
    blerepl: true,         // Is REPL on Bluetooth - can Espruino IDE be used?
    log: false,            // Do log messages appear on screen?
    timeout: 10,           // Default LCD timeout in seconds
    vibrate: true,         // Vibration enabled by default. App must support
    beep: "vib",            // Beep enabled by default. App must support
    timezone: 0,           // Set the timezone for the device
    HID: false,           // BLE HID mode, off by default
    clock: null,           // a string for the default clock's name
    "12hour" : false,      // 12 or 24 hour clock?
    brightness: 1,       // LCD brightness from 0 to 1
    // welcomed : undefined/true (whether welcome app should show)
    options: {
      wakeOnBTN1: true,
      wakeOnBTN2: true,
      wakeOnBTN3: true,
      wakeOnFaceUp: false,
      wakeOnTouch: false,
      wakeOnTwist: true,
      twistThreshold: 819.2,
      twistMaxY: -800,
      twistTimeout: 1000
    }
  };
  updateSettings();
}

settings = storage.readJSON('setting.json', 1);
if (!settings) resetSettings();

const boolFormat = v => v ? "On" : "Off";

function showMainMenu() {
  var beepV = [false, true, "vib"];
  var beepN = ["Off", "Piezo", "Vibrate"];
  const mainmenu = {
    '': { 'title': 'Settings' },
    'Make Connectable': makeConnectable,
    'BLE': {
      value: settings.ble,
      format: boolFormat,
      onchange: () => {
        settings.ble = !settings.ble;
        updateSettings();
      }
    },
    'Programmable': {
      value: settings.blerepl,
      format: boolFormat,
      onchange: () => {
        settings.blerepl = !settings.blerepl;
        updateSettings();
      }
    },
    'Debug info': {
      value: settings.log,
      format: v => v ? "Show" : "Hide",
      onchange: () => {
        settings.log = !settings.log;
        updateSettings();
      }
    },
    'LCD Timeout': {
      value: settings.timeout,
      min: 0,
      max: 60,
      step: 5,
      onchange: v => {
        settings.timeout = 0 | v;
        updateSettings();
        Bangle.setLCDTimeout(settings.timeout);
      }
    },
    'LCD Brightness': {
      value: settings.brightness,
      min: 0,
      max: 1,
      step: 0.1,
      onchange: v => {
        settings.brightness = v || 1;
        updateSettings();
        Bangle.setLCDBrightness(settings.brightness);
      }
    },
    'Beep': {
      value: 0 | beepV.indexOf(settings.beep),
      min: 0, max: 2,
      format: v => beepN[v],
      onchange: v => {
        settings.beep = beepV[v];
        if (v==1) { analogWrite(D18,0.5,{freq:2000});setTimeout(()=>D18.reset(),200); } // piezo
        else if (v==2) { analogWrite(D13,0.1,{freq:2000});setTimeout(()=>D13.reset(),200); } // vibrate
        updateSettings();
      }
    },
    'Vibration': {
      value: settings.vibrate,
      format: boolFormat,
      onchange: () => {
        settings.vibrate = !settings.vibrate;
        updateSettings();
        if (settings.vibrate) {
          VIBRATE.write(1);
          setTimeout(() => VIBRATE.write(0), 10);
        }
      }
    },
    'Locale': showLocaleMenu,
    'Select Clock': showClockMenu,
    'HID': {
      value: settings.HID,
      format: boolFormat,
      onchange: () => {
        settings.HID = !settings.HID;
        updateSettings();
      }
    },
    'Set Time': showSetTimeMenu,
    'LCD Wake-Up': showWakeUpMenu,
    'App/widget settings': showAppSettingsMenu,
    'Reset Settings': showResetMenu,
    'Turn Off': Bangle.off,
    '< Back': () => { load(); }
  };
  return E.showMenu(mainmenu);
}

function showWakeUpMenu() {
  const wakeUpMenu = {
    '': { 'title': 'LCD Wake-Up' },
    '< Back': showMainMenu,
    'Wake On BTN1': {
      value: settings.options.wakeOnBTN1,
      format: boolFormat,
      onchange: () => {
        settings.options.wakeOnBTN1 = !settings.options.wakeOnBTN1;
        updateOptions();
      }
    },
    'Wake On BTN2': {
      value: settings.options.wakeOnBTN2,
      format: boolFormat,
      onchange: () => {
        settings.options.wakeOnBTN2 = !settings.options.wakeOnBTN2;
        updateOptions();
      }
    },
    'Wake On BTN3': {
      value: settings.options.wakeOnBTN3,
      format: boolFormat,
      onchange: () => {
        settings.options.wakeOnBTN3 = !settings.options.wakeOnBTN3;
        updateOptions();
      }
    },
    'Wake on FaceUp': {
      value: settings.options.wakeOnFaceUp,
      format: boolFormat,
      onchange: () => {
        settings.options.wakeOnFaceUp = !settings.options.wakeOnFaceUp;
        updateOptions();
      }
    },
    'Wake on Touch': {
      value: settings.options.wakeOnTouch,
      format: boolFormat,
      onchange: () => {
        settings.options.wakeOnTouch = !settings.options.wakeOnTouch;
        updateOptions();
      }
    },
    'Wake On Twist': {
      value: settings.options.wakeOnTwist,
      format: boolFormat,
      onchange: () => {
        settings.options.wakeOnTwist = !settings.options.wakeOnTwist;
        updateOptions();
      }
    },
    'Twist Threshold': {
      value: internalToG(settings.options.twistThreshold),
      min: -0.5,
      max: 0.5,
      step: 0.01,
      onchange: v => {
        settings.options.twistThreshold = gToInternal(v || 0.1);
        updateOptions();
      }
    },
    'Twist Max Y': {
      value: settings.options.twistMaxY,
      min: -1500,
      max: 1500,
      step: 100,
      onchange: v => {
        settings.options.twistMaxY = v || -800;
        updateOptions();
      }
    },
    'Twist Timeout': {
      value: settings.options.twistTimeout,
      min: 0,
      max: 2000,
      step: 100,
      onchange: v => {
        settings.options.twistTimeout = v || 1000;
        updateOptions();
      }
    }
  }
  return E.showMenu(wakeUpMenu)
}

function showLocaleMenu() {
  const localemenu = {
    '': { 'title': 'Locale' },
    '< Back': showMainMenu,
    'Time Zone': {
      value: settings.timezone,
      min: -11,
      max: 12,
      step: 0.5,
      onchange: v => {
        settings.timezone = v || 0;
        updateSettings();
      }
    },
    'Clock Style': {
      value: !!settings["12hour"],
      format: v => v ? "12hr" : "24hr",
      onchange: v => {
        settings["12hour"] = v;
        updateSettings();
      }
    }
  };
  return E.showMenu(localemenu);
}

function showResetMenu() {
  const resetmenu = {
    '': { 'title': 'Reset' },
    '< Back': showMainMenu,
    'Reset Settings': () => {
      E.showPrompt('Reset Settings?').then((v) => {
        if (v) {
          E.showMessage('Resetting');
          resetSettings();
        }
        setTimeout(showMainMenu, 50);
      });
    }
  };
  return E.showMenu(resetmenu);
}

function makeConnectable() {
  try { NRF.wake(); } catch (e) { }
  Bluetooth.setConsole(1);
  var name = "Bangle.js " + NRF.getAddress().substr(-5).replace(":", "");
  E.showPrompt(name + "\nStay Connectable?", { title: "Connectable" }).then(r => {
    if (settings.ble != r) {
      settings.ble = r;
      updateSettings();
    }
    if (!r) try { NRF.sleep(); } catch (e) { }
    showMainMenu();
  });
}
function showClockMenu() {
  var clockApps = require("Storage").list(/\.info$/).map(app => {
    try { return require("Storage").readJSON(app); }
    catch (e) { }
  }).filter(app => app.type == "clock").sort((a, b) => a.sortorder - b.sortorder);
  const clockMenu = {
    '': {
      'title': 'Select Clock',
    },
    '< Back': showMainMenu,
  };
  clockApps.forEach((app, index) => {
    var label = app.name;
    if ((!settings.clock && index === 0) || (settings.clock === app.src)) {
      label = "* " + label;
    }
    clockMenu[label] = () => {
      if (settings.clock !== app.src) {
        settings.clock = app.src;
        updateSettings();
        showMainMenu();
      }
    };
  });
  if (clockApps.length === 0) {
    clockMenu["No Clocks Found"] = () => { };
  }
  return E.showMenu(clockMenu);
}



function showSetTimeMenu() {
  d = new Date();
  const timemenu = {
    '': {
      'title': 'Set Time',
      'predraw': function () {
        d = new Date();
        timemenu.Hour.value = d.getHours();
        timemenu.Minute.value = d.getMinutes();
        timemenu.Second.value = d.getSeconds();
        timemenu.Date.value = d.getDate();
        timemenu.Month.value = d.getMonth() + 1;
        timemenu.Year.value = d.getFullYear();
      }
    },
    '< Back': showMainMenu,
    'Hour': {
      value: d.getHours(),
      min: 0,
      max: 23,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setHours(v);
        setTime(d.getTime() / 1000);
      }
    },
    'Minute': {
      value: d.getMinutes(),
      min: 0,
      max: 59,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setMinutes(v);
        setTime(d.getTime() / 1000);
      }
    },
    'Second': {
      value: d.getSeconds(),
      min: 0,
      max: 59,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setSeconds(v);
        setTime(d.getTime() / 1000);
      }
    },
    'Date': {
      value: d.getDate(),
      min: 1,
      max: 31,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setDate(v);
        setTime(d.getTime() / 1000);
      }
    },
    'Month': {
      value: d.getMonth() + 1,
      min: 1,
      max: 12,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setMonth(v - 1);
        setTime(d.getTime() / 1000);
      }
    },
    'Year': {
      value: d.getFullYear(),
      min: 2019,
      max: 2100,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setFullYear(v);
        setTime(d.getTime() / 1000);
      }
    }
  };
  return E.showMenu(timemenu);
}

function showAppSettingsMenu() {
  let appmenu = {
    '': { 'title': 'App Settings' },
    '< Back': showMainMenu,
  }
  const apps = storage.list(/\.info$/)
    .map(app => storage.readJSON(app, 1))
    .filter(app => app && app.settings)
    .sort((a, b) => a.sortorder - b.sortorder)
  if (apps.length === 0) {
    appmenu['No app has settings'] = () => { };
  }
  apps.forEach(function (app) {
    appmenu[app.name] = () => { showAppSettings(app) };
  })
  E.showMenu(appmenu)
}
function showAppSettings(app) {
  const showError = msg => {
    E.showMessage(`${app.name}:\n${msg}!\n\nBTN1 to go back`);
    setWatch(showAppSettingsMenu, BTN1, { repeat: false });
  }
  let appSettings = storage.read(app.settings);
  if (!appSettings) {
    return showError('Missing settings');
  }
  try {
    appSettings = eval(appSettings);
  } catch (e) {
    console.log(`${app.name} settings error:`, e)
    return showError('Error in settings');
  }
  if (typeof appSettings !== "function") {
    return showError('Invalid settings');
  }
  try {
    // pass showAppSettingsMenu as "back" argument
    appSettings(showAppSettingsMenu);
  } catch (e) {
    console.log(`${app.name} settings error:`, e)
    return showError('Error in settings');
  }
}

showMainMenu();
