Bangle.loadWidgets();
Bangle.drawWidgets();

const storage = require('Storage');
let settings;

function updateSettings() {
  //storage.erase('setting.json'); // - not needed, just causes extra writes if settings were the same
  storage.write('setting.json', settings);
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
    HID : false,           // BLE HID mode, off by default
    clock: null,           // a string for the default clock's name
    "12hour" : false,      // 12 or 24 hour clock?
    // welcomed : undefined/true (whether welcome app should show)
  };
  updateSettings();
}

settings = storage.readJSON('setting.json',1);
if (!settings) resetSettings();

const boolFormat = v => v ? "On" : "Off";

function showMainMenu() {
  var beepV = [ false,true,"vib" ];
  var beepN = [ "Off","Piezo","Vibrate" ];
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
    'Beep': {
      value: 0|beepV.indexOf(settings.beep),
      min:0,max:2,
      format: v=>beepN[v],
      onchange: v => {
        settings.beep = beepV[v];
        if (v==1) { analogWrite(D18,0.5,{freq:2000});setTimeout(()=>D18.reset(),200) } // piezo
        else if (v==2) { analogWrite(D13,0.1,{freq:2000});setTimeout(()=>D13.reset(),200) } // vibrate
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
          setTimeout(()=>VIBRATE.write(0), 10);
        }
      }
    },
    'Welcome App': {
      value: !settings.welcomed,
      format: boolFormat,
      onchange: v => {
        settings.welcomed = v?undefined:true;
        updateSettings();
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
    'Reset Settings': showResetMenu,
    'Turn Off': Bangle.off,
    '< Back': ()=> {load();}
  };
  return E.showMenu(mainmenu);
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
      format : v => v?"12hr":"24hr",
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
  try { NRF.wake(); } catch(e) {}
  Bluetooth.setConsole(1);
  var name="Bangle.js "+NRF.getAddress().substr(-5).replace(":","");
  E.showPrompt(name+"\nStay Connectable?",{title:"Connectable"}).then(r=>{
    if (settings.ble!=r) {
      settings.ble = r;
      updateSettings();
    }
    if (!r) try { NRF.sleep(); } catch(e) {}
    showMainMenu();
  });
}
function showClockMenu() {
  var clockApps = require("Storage").list(/\.info$/).map(app=>{
    try { return require("Storage").readJSON(app); }
    catch (e) {}
  }).filter(app=>app.type=="clock").sort((a, b) => a.sortorder - b.sortorder);
  const clockMenu = {
    '': {
      'title': 'Select Clock',
    },
    '< Back': showMainMenu,
  };
  clockApps.forEach((app,index) => {
    var label = app.name;
    if ((!settings.clock && index === 0) || (settings.clock === app.src)) {
      label = "* "+label;
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
     clockMenu["No Clocks Found"] = () => {};
  }
  return E.showMenu(clockMenu);
}



function showSetTimeMenu() {
  d = new Date();
  const timemenu = {
    '': {
      'title': 'Set Time',
      'predraw': function() {
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
        setTime(d.getTime()/1000);
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
        setTime(d.getTime()/1000);
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
        setTime(d.getTime()/1000);
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
        setTime(d.getTime()/1000);
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
        setTime(d.getTime()/1000);
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
        setTime(d.getTime()/1000);
      }
    }
  };
  return E.showMenu(timemenu);
}

showMainMenu();
