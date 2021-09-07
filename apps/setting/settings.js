Bangle.loadWidgets();
Bangle.drawWidgets();

const storage = require('Storage');
let settings;

function updateSettings() {
  //storage.erase('setting.json'); // - not needed, just causes extra writes if settings were the same
  if (Object.keys(settings.qmOptions).length === 0) delete settings.qmOptions;
  storage.write('setting.json', settings);
  if (!('qmOptions' in settings)) settings.qmOptions = {};  // easier if this always exists in this file
}

function updateOptions() {
  updateSettings();
  Bangle.setOptions(settings.options)
  if (settings.quiet) {
    Bangle.setOptions(settings.qmOptions)
  }
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
    quiet: 0,              // quiet mode:  0: off, 1: priority only, 2: total silence
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
    },
    // Quiet Mode options:
    // we only set these if we want to override the default value
    // qmOptions: {},
    // qmBrightness: undefined,
    // qmTimeout: undefined,
  };
  updateSettings();
}

settings = storage.readJSON('setting.json', 1);
if (!settings) resetSettings();
if (!('qmOptions' in settings)) settings.qmOptions = {}; // easier if this always exists in here

const boolFormat = v => v ? "On" : "Off";

function showMainMenu() {
  var beepV = [false, true, "vib"];
  var beepN = ["Off", "Piezo", "Vibrate"];
  const mainmenu = {
    '': { 'title': 'Settings' },
    'Make Connectable': ()=>makeConnectable(),
    'App/Widget Settings': ()=>showAppSettingsMenu(),
    'BLE': ()=>showBLEMenu(),
    'Debug Info': {
      value: settings.log,
      format: v => v ? "Show" : "Hide",
      onchange: () => {
        settings.log = !settings.log;
        updateSettings();
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
    "Quiet Mode": ()=>showQuietModeMenu(),
    'Locale': ()=>showLocaleMenu(),
    'Select Clock': ()=>showClockMenu(),
    'Set Time': ()=>showSetTimeMenu(),
    'LCD': ()=>showLCDMenu(),
    'Theme': ()=>showThemeMenu(),
    'Reset Settings': ()=>showResetMenu(),
    'Turn Off': ()=>{ if (Bangle.softOff) Bangle.softOff(); else Bangle.off() },
    '< Back': ()=>load()
  };
  return E.showMenu(mainmenu);
}

function showBLEMenu() {
  var hidV = [false, "kbmedia", "kb", "joy"];
  var hidN = ["Off", "Kbrd & Media", "Kbrd","Joystick"];
  E.showMenu({
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
    'HID': {
      value: 0 | hidV.indexOf(settings.HID),
      min: 0, max: 3,
      format: v => hidN[v],
      onchange: v => {
        settings.HID = hidV[v];
        updateSettings();
      }
    },
    'Passkey BETA': {
      value: settings.passkey?settings.passkey:"none",
      onchange: () => setTimeout(showPasskeyMenu) // graphical_menu redraws after the call
    },
    'Whitelist': {
      value: settings.whitelist?(settings.whitelist.length+" devs"):"off",
      onchange: () => setTimeout(showWhitelistMenu) // graphical_menu redraws after the call
    },
    '< Back': ()=>showMainMenu()
  });
}

function showThemeMenu() {
  function cl(x) { return g.setColor(x).getColor(); }
  function upd(th) {
    g.theme = th;
    settings.theme = th;
    updateSettings();
    delete g.reset;
    g._reset = g.reset;
    g.reset = function(n) { return g._reset().setColor(th.fg).setBgColor(th.bg); };
    g.clear = function(n) { if (n) g.reset(); return g.clearRect(0,0,g.getWidth(),g.getHeight()); };
    g.clear(1);
    Bangle.drawWidgets();
    m.draw();
  }
  var m = E.showMenu({
    'Dark BW': ()=>{
      upd({
        fg:cl("#fff"), bg:cl("#000"),
        fg2:cl("#0ff"), bg2:cl("#000"),
        fgH:cl("#fff"), bgH:cl("#00f"),
        dark:true
      });
    },
    'Light BW': ()=>{
      upd({
        fg:cl("#000"), bg:cl("#fff"),
        fg2:cl("#00f"), bg2:cl("#0ff"),
        fgH:cl("#000"), bgH:cl("#0ff"),
        dark:false
      });
    },
    '< Back': ()=>showMainMenu()
  });
}

function showPasskeyMenu() {
  var menu = {
    "Disable" : () => {
      settings.passkey = undefined;
      updateSettings();
      showBLEMenu();
    }
  };
  if (!settings.passkey || settings.passkey.length!=6)
    settings.passkey = "123456";
  for (var i=0;i<6;i++) (function(i){
    menu[`Digit ${i+1}`] = {
      value : 0|settings.passkey[i],
      min: 0, max: 9,
      onchange: v => {
        var p = settings.passkey.split("");
        p[i] = v;
        settings.passkey = p.join("");
        updateSettings();
      }
    };
  })(i);
  menu['< Back']=()=>showBLEMenu();
  E.showMenu(menu);
}

function showWhitelistMenu() {
  var menu = {
    "Disable" : () => {
      settings.whitelist = undefined;
      updateSettings();
      showBLEMenu();
    }
  };
  if (settings.whitelist) settings.whitelist.forEach(function(d){
    menu[d.substr(0,17)] = function() {
      E.showPrompt('Remove\n'+d).then((v) => {
        if (v) {
          settings.whitelist.splice(settings.whitelist.indexOf(d),1);
          updateSettings();
        }
        setTimeout(showWhitelistMenu, 50);
      });
    }
  });
  menu['Add Device']=function() {
    E.showAlert("Connect device\nto add to\nwhitelist","Whitelist").then(function() {
      NRF.removeAllListeners('connect');
      showWhitelistMenu();
    });
    NRF.removeAllListeners('connect');
    NRF.on('connect', function(addr) {
      if (!settings.whitelist) settings.whitelist=[];
      settings.whitelist.push(addr);
      updateSettings();
      NRF.removeAllListeners('connect');
      showWhitelistMenu();
    });
  };
  menu['< Back']=()=>showBLEMenu();
  E.showMenu(menu);
}

function showLCDMenu() {
  const lcdMenu = {
    '': { 'title': 'LCD' },
    '< Back': ()=>showMainMenu(),
    'LCD Brightness': {
      value: settings.brightness,
      min: 0.1,
      max: 1,
      step: 0.1,
      onchange: v => {
        settings.brightness = v || 1;
        updateSettings();
        if (!(settings.quiet && "qmBrightness" in settings)) {
          Bangle.setLCDBrightness(settings.brightness);
        }
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
        if (!(settings.quiet && "qmTimeout" in settings)) {
          Bangle.setLCDTimeout(settings.timeout);
        }
      }
    },
    'Wake on BTN1': {
      value: settings.options.wakeOnBTN1,
      format: boolFormat,
      onchange: () => {
        settings.options.wakeOnBTN1 = !settings.options.wakeOnBTN1;
        updateOptions();
      }
    },
    'Wake on BTN2': {
      value: settings.options.wakeOnBTN2,
      format: boolFormat,
      onchange: () => {
        settings.options.wakeOnBTN2 = !settings.options.wakeOnBTN2;
        updateOptions();
      }
    },
    'Wake on BTN3': {
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
    'Wake on Twist': {
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
  return E.showMenu(lcdMenu)
}
function showQuietModeMenu() {
  // we always keep settings.quiet and settings.qmOptions
  // other qm values are deleted when not set
  const modes = ["Off", "Alarms", "Silent"];
  const qmDisabledFormat = v => v ? "Off" : "-";
  const qmMenu = {
    "": {"title": "Quiet Mode"},
    "< Back": () => showMainMenu(),
    "Quiet Mode": {
      value: settings.quiet|0,
      format: v => modes[v%3],
      onchange: v => {
        settings.quiet = v%3;
        updateSettings();
        updateOptions();
        if ("qmsched" in WIDGETS) {WIDGETS["qmsched"].draw();}
      },
    },
    "LCD Brightness": {
      value: settings.qmBrightness || 0,
      min: 0, // 0 = use default
      max: 1,
      step: 0.1,
      format: v => (v>0.05) ? v : "-",
      onchange: v => {
        if (v>0.05) { // prevent v=0.000000000000001 bugs
          settings.qmBrightness = v;
        } else {
          delete settings.qmBrightness;
        }
        updateSettings();
        if (settings.qmBrightness) { // show result, even if not quiet right now
          Bangle.setLCDBrightness(v);
        } else {
          Bangle.setLCDBrightness(settings.brightness);
        }
      },
    },
    "LCD Timeout": {
      value: settings.qmTimeout || 0,
      min: 0, // 0 = use default  (no constant on for quiet mode)
      max: 60,
      step: 5,
      format: v => v>1 ? v : "-",
      onchange: v => {
        if (v>1) {
          settings.qmTimeout = v;
        } else {
          delete settings.qmTimeout;
        }
        updateSettings();
        if (settings.quiet && v>1) {
          Bangle.setLCDTimeout(v);
        } else {
          Bangle.setLCDTimeout(settings.timeout);
        }
      },
    },
    // we disable wakeOn* events by overwriting them as false in qmOptions
    // not disabled = not present in qmOptions at all
    "Wake on FaceUp": {
      value: "wakeOnFaceUp" in settings.qmOptions,
      format: qmDisabledFormat,
      onchange: () => {
        if ("wakeOnFaceUp" in settings.qmOptions) {
          delete settings.qmOptions.wakeOnFaceUp;
        } else {
          settings.qmOptions.wakeOnFaceUp = false;
        }
        updateOptions();
      },
    },
    "Wake on Touch": {
      value: "wakeOnTouch" in settings.qmOptions,
      format: qmDisabledFormat,
      onchange: () => {
        if ("wakeOnTouch" in settings.qmOptions) {
          delete settings.qmOptions.wakeOnTouch;
        } else {
          settings.qmOptions.wakeOnTouch = false;
        }
        updateOptions();
      },
    },
    "Wake on Twist": {
      value: "wakeOnTwist" in settings.qmOptions,
      format: qmDisabledFormat,
      onchange: () => {
        if ("wakeOnTwist" in settings.qmOptions) {
          delete settings.qmOptions.wakeOnTwist;
        } else {
          settings.qmOptions.wakeOnTwist = false;
        }
        updateOptions();
      },
    },
  };
  return E.showMenu(qmMenu);
}

function showLocaleMenu() {
  const localemenu = {
    '': { 'title': 'Locale' },
    '< Back': ()=>showMainMenu(),
    'Time Zone': {
      value: settings.timezone,
      min: -11,
      max: 13,
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
    '< Back': ()=>showMainMenu(),
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
  var clockApps = require("Storage").list(/\.info$/)
    .map(app => {var a=storage.readJSON(app, 1);return (a&&a.type == "clock")?a:undefined})
    .filter(app => app) // filter out any undefined apps
    .sort((a, b) => a.sortorder - b.sortorder);
  const clockMenu = {
    '': {
      'title': 'Select Clock',
    },
    '< Back': ()=>showMainMenu(),
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
    '': { 'title': 'Set Time' },
    '< Back': function () {
      setTime(d.getTime() / 1000);
      showMainMenu();
    },
    'Hour': {
      value: d.getHours(),
      onchange: function (v) {
        this.value = (v+24)%24;
        d.setHours(this.value);
      }
    },
    'Minute': {
      value: d.getMinutes(),
      onchange: function (v) {
        this.value = (v+60)%60;
        d.setMinutes(this.value);
      }
    },
    'Second': {
      value: d.getSeconds(),
      onchange: function (v) {
        this.value = (v+60)%60;
        d.setSeconds(this.value);
      }
    },
    'Date': {
      value: d.getDate(),
      onchange: function (v) {
        this.value = ((v+30)%31)+1;
        d.setDate(this.value);
      }
    },
    'Month': {
      value: d.getMonth() + 1,
      onchange: function (v) {
        this.value = ((v+11)%12)+1;
        d.setMonth(this.value - 1);
      }
    },
    'Year': {
      value: d.getFullYear(),
      min: 2019,
      max: 2100,
      onchange: function (v) {
        d.setFullYear(v);
      }
    }
  };
  return E.showMenu(timemenu);
}

function showAppSettingsMenu() {
  let appmenu = {
    '': { 'title': 'App Settings' },
    '< Back': ()=>showMainMenu(),
  }
  const apps = storage.list(/\.settings\.js$/)
    .map(s => s.substr(0, s.length-12))
    .map(id => {
      const a=storage.readJSON(id+'.info',1) || {name: id};
      return {id:id,name:a.name,sortorder:a.sortorder};
    })
    .sort((a, b) => {
      const n = (0|a.sortorder)-(0|b.sortorder);
      if (n) return n; // do sortorder first
      if (a.name<b.name) return -1;
      if (a.name>b.name) return 1;
      return 0;
    })
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
  let appSettings = storage.read(app.id+'.settings.js');
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
    appSettings(()=>showAppSettingsMenu());
  } catch (e) {
    console.log(`${app.name} settings error:`, e)
    return showError('Error in settings');
  }
}

showMainMenu();
