{
Bangle.loadWidgets();
Bangle.drawWidgets();

const BANGLEJS2 = process.env.HWVERSION==2;
const storage = require('Storage');
let settings;

function updateSettings() {
  //storage.erase('setting.json'); // - not needed, just causes extra writes if settings were the same
  storage.write('setting.json', settings);
}

function updateOptions() {
  var o = settings.options;
  // Check to make sure nobody disabled all wakeups and locked themselves out!
  if (BANGLEJS2) {
    if (!(o.wakeOnBTN1||o.wakeOnFaceUp||o.wakeOnTouch||o.wakeOnDoubleTap||o.wakeOnTwist)) {
      o.wakeOnBTN1 = true;
    }
  } else {
    if (!(o.wakeOnBTN1||o.wakeOnBTN2||o.wakeOnBTN3||o.wakeOnFaceUp||o.wakeOnTouch||o.wakeOnTwist))
      o.wakeOnBTN2 = true;
  }
  updateSettings();
  Bangle.setOptions(o)
}



function resetSettings() {
  settings = {
    ble: true,                      // Bluetooth enabled by default
    blerepl: true,                  // Is REPL on Bluetooth - can Espruino IDE be used?
    log: false,                     // Do log messages appear on screen?
    quiet: 0,                       // quiet mode:  0: off, 1: priority only, 2: total silence
    timeout: 10,                    // Default LCD timeout in seconds
    vibrate: true,                  // Vibration enabled by default. App must support
    beep: BANGLEJS2 ? true : "vib", // Beep enabled by default. App must support
    timezone: 0,                    // Set the timezone for the device
    HID: false,                     // BLE HID mode, off by default
    clock: null,                    // a string for the default clock's name
    // clockHasWidgets: false,      // Does the clock in 'clock' contain the string 'Bangle.loadWidgets'
    "12hour" : false,               // 12 or 24 hour clock?
    firstDayOfWeek: 0,              // 0 -> Sunday (default), 1 -> Monday
    brightness: 1,                  // LCD brightness from 0 to 1
    // welcomed : undefined/true (whether welcome app should show)
    options: {
      wakeOnBTN1: true,
      wakeOnBTN2: true,
      wakeOnBTN3: true,
      wakeOnFaceUp: false,
      wakeOnTouch: false,
      wakeOnTwist: false,
      twistThreshold: 819.2,
      twistMaxY: -800,
      twistTimeout: 1000
    },
  };
  updateSettings();
}

settings = storage.readJSON('setting.json', 1);
if (("object" != typeof settings) ||
    ("object" != typeof settings.options))
  resetSettings();

function showMainMenu() {

  const mainmenu = {
    '': { 'title': /*LANG*/'Settings' },
    '< Back': ()=>load(),
    /*LANG*/'Apps': ()=>showAppSettingsMenu(),
    /*LANG*/'System': ()=>showSystemMenu(),
    /*LANG*/'Bluetooth': ()=>showBLEMenu(),
    /*LANG*/'Alerts': ()=>showAlertsMenu(),
    /*LANG*/'Utils': ()=>showUtilMenu()
  };

  return E.showMenu(mainmenu);
}

function showSystemMenu() {

  const mainmenu = {
    '': { 'title': /*LANG*/'System' },
    '< Back': ()=>showMainMenu(),
    /*LANG*/'Theme': ()=>showThemeMenu(),
    /*LANG*/'LCD': ()=>showLCDMenu(),
    /*LANG*/'Locale': ()=>showLocaleMenu(),
    /*LANG*/'Clock': ()=>showClockMenu(),
    /*LANG*/'Launcher': ()=>showLauncherMenu(),
    /*LANG*/'Date & Time': ()=>showSetTimeMenu()
  };

  return E.showMenu(mainmenu);
}

function showAlertsMenu() {
  var beepMenuItem;
  if (BANGLEJS2) {
    beepMenuItem = {
      value: settings.beep!=false,
      onchange: v => {
        settings.beep = v;
        updateSettings();
        if (settings.beep) {
          analogWrite(VIBRATE,0.1,{freq:2000});
          setTimeout(()=>VIBRATE.reset(),200);
        } // beep with vibration moter
      }
    };
  } else { // Bangle.js 1
    var beepV = [false, true, "vib"];
    var beepN = [/*LANG*/"Off", /*LANG*/"Piezo", /*LANG*/"Vibrate"];
    beepMenuItem = {
      value: Math.max(0 | beepV.indexOf(settings.beep),0),
      min: 0, max: beepV.length-1,
      format: v => beepN[v],
      onchange: v => {
        settings.beep = beepV[v];
        if (v==1) { analogWrite(D18,0.5,{freq:2000});setTimeout(()=>D18.reset(),200); } // piezo on Bangle.js 1
        else if (v==2) { analogWrite(VIBRATE,0.1,{freq:2000});setTimeout(()=>VIBRATE.reset(),200); } // vibrate
        updateSettings();
      }
    };
  }

  const mainmenu = {
    '': { 'title': /*LANG*/'Alerts' },
    '< Back': ()=>showMainMenu(),
    /*LANG*/'Beep': beepMenuItem,
    /*LANG*/'Vibration': {
      value: settings.vibrate,
      onchange: () => {
        settings.vibrate = !settings.vibrate;
        updateSettings();
        if (settings.vibrate) {
          VIBRATE.write(1);
          setTimeout(() => VIBRATE.write(0), 10);
        }
      }
    },
    /*LANG*/"Quiet Mode": {
      value: settings.quiet|0,
      format: v => [/*LANG*/"Off", /*LANG*/"Alarms", /*LANG*/"Silent"][v%3],
      onchange: v => {
        settings.quiet = v%3;
        updateSettings();
        updateOptions();
        if ("qmsched" in WIDGETS) WIDGETS["qmsched"].draw();
      },
    }
  };

  return E.showMenu(mainmenu);
}


function showBLEMenu() {
  var hidV = [false, "kbmedia", "kb", "com", "joy"];
  var hidN = [/*LANG*/"Off", /*LANG*/"Kbrd & Media", /*LANG*/"Kbrd", /*LANG*/"Kbrd & Mouse", /*LANG*/"Joystick"];
  var privacy = [/*LANG*/"Off", /*LANG*/"Show name", /*LANG*/"Hide name"];

  E.showMenu({
    '': { 'title': /*LANG*/'Bluetooth' },
    '< Back': ()=>showMainMenu(),
    /*LANG*/'Make Connectable': ()=>makeConnectable(),
    /*LANG*/'BLE': {
      value: settings.ble,
      onchange: () => {
        settings.ble = !settings.ble;
        updateSettings();
      }
    },
    /*LANG*/'Programmable': {
      value: settings.blerepl,
      onchange: () => {
        settings.blerepl = !settings.blerepl;
        updateSettings();
      }
    },
    /*LANG*/'Privacy': {
      min: 0, max: privacy.length-1,
      format: v => privacy[v],
      value: (() => {
        // settings.bleprivacy may be some custom object, but we ignore that for now
        if (settings.bleprivacy && settings.blename === false) return 2;
        if (settings.bleprivacy) return 1;
        return 0;
      })(),
      onchange: v => {
        settings.bleprivacy = 0;
        delete settings.blename;
        switch (v) {
          case 0:
            break;
          case 1:
            settings.bleprivacy = 1;
            break;
          case 2:
            settings.bleprivacy = 1;
            settings.blename = false;
            break;
        }
        updateSettings();
      }
    },
    /*LANG*/'HID': {
      value: Math.max(0,0 | hidV.indexOf(settings.HID)),
      min: 0, max: hidN.length-1,
      format: v => hidN[v],
      onchange: v => {
        settings.HID = hidV[v];
        updateSettings();
      }
    },
    /*LANG*/'Passkey': {
      value: settings.passkey?settings.passkey:/*LANG*/"none",
      onchange: () => setTimeout(showPasskeyMenu) // graphical_menu redraws after the call
    },
    /*LANG*/'Whitelist': {
      value:
        (
          (settings.whitelist_disabled || !settings.whitelist) ? /*LANG*/"off" : /*LANG*/"on"
        ) + (
          settings.whitelist
          ? " (" + settings.whitelist.length + ")"
          : ""
        ),
      onchange: () => setTimeout(showWhitelistMenu) // graphical_menu redraws after the call
    }
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

  var themesMenu = {
    '':{title:/*LANG*/'Theme'},
    '< Back': ()=>showSystemMenu(),
    /*LANG*/'Dark BW': ()=>{
      upd({
        fg:cl("#fff"), bg:cl("#000"),
        fg2:cl("#fff"), bg2:cl("#004"),
        fgH:cl("#fff"), bgH:cl("#00f"),
        dark:true
      });
    },
    /*LANG*/'Light BW': ()=>{
      upd({
        fg:cl("#000"), bg:cl("#fff"),
        fg2:cl("#000"), bg2:cl("#cff"),
        fgH:cl("#000"), bgH:cl("#0ff"),
        dark:false
      });
    }
  };

  storage.list(/^.*\.theme$/).forEach(
    n => {
      let newTheme = storage.readJSON(n);
      themesMenu[newTheme.name ? newTheme.name : n] = () => {
        upd({
        fg:cl(newTheme.fg), bg:cl(newTheme.bg),
        fg2:cl(newTheme.fg2), bg2:cl(newTheme.bg2),
        fgH:cl(newTheme.fgH), bgH:cl(newTheme.bgH),
        dark:newTheme.dark
      });
      };
    }
  );

  themesMenu[/*LANG*/'Customize'] = () => showCustomThemeMenu();

  var m = E.showMenu(themesMenu);

  function showCustomThemeMenu() {
    function setT(t, v) {
      let th = g.theme;
      th[t] = v;
      if (t==="bg") {
        th['dark'] = (v===cl("#000"));
      }
      upd(th);
    }
    let rgb = {};
    rgb[/*LANG*/'black'] = "#000";
    rgb[/*LANG*/'white'] = "#fff";
    rgb[/*LANG*/'red'] = "#f00";
    rgb[/*LANG*/'green'] = "#0f0";
    rgb[/*LANG*/'blue'] = "#00f";
    rgb[/*LANG*/'cyan'] = "#0ff";
    rgb[/*LANG*/'magenta'] = "#f0f";
    rgb[/*LANG*/'yellow'] = "#ff0";
    if (!BANGLEJS2) {
      // these would cause dithering, which is not great for e.g. text
      rgb[/*LANG*/'orange'] = "#ff7f00";
      rgb[/*LANG*/'purple'] = "#7f00ff";
      rgb[/*LANG*/'grey'] = "#7f7f7f";
    }
    let colors = [], names = [];
    for(const c in rgb) {
      names.push(c);
      colors.push(cl(rgb[c]));
    }
    let menu = {
      '':{title:/*LANG*/'Custom Theme'},
      "< Back": () => showThemeMenu()
    };
    const labels = {
      fg: /*LANG*/'Foreground', bg: /*LANG*/'Background',
      fg2: /*LANG*/'Foreground 2', bg2: /*LANG*/'Background 2',
      fgH: /*LANG*/'Highlight FG', bgH: /*LANG*/'Highlight BG',
    };
    ["fg", "bg", "fg2", "bg2", "fgH", "bgH"].forEach(t => {
      menu[labels[t]] = {
          min : 0, max : colors.length-1, wrap : true,
          value: Math.max(colors.indexOf(g.theme[t]),0),
          format: v => names[v],
          onchange: function(v) {
            var c = colors[v];
            // if we select the same fg and bg: set the other to the old color
            // e.g. bg=black;fg=white, user selects fg=black -> bg changes to white automatically
            // so users don't end up with a black-on-black menu
            if (t === 'fg' && g.theme.bg === c) setT('bg', g.theme.fg);
            if (t === 'bg' && g.theme.fg === c) setT('fg', g.theme.bg);
            setT(t, c);
          },
        };
    });
    menu["< Back"] = () => showThemeMenu();
    m = E.showMenu(menu);
  }
}

function showPasskeyMenu() {
  var menu = {
    "< Back" : ()=>showBLEMenu(),
    /*LANG*/"Disable" : () => {
      settings.passkey = undefined;
      updateSettings();
      showBLEMenu();
    }
  };
  if (!settings.passkey || settings.passkey.length!=6) {
    settings.passkey = "123456";
    updateSettings();
  }
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
  E.showMenu(menu);
}

function showWhitelistMenu() {
  var menu = {
    "< Back" : ()=>showBLEMenu(),
  };
  if (settings.whitelist_disabled) {
    menu[/*LANG*/"Enable"] = () => {
      delete settings.whitelist_disabled;
      updateSettings();
      showBLEMenu();
    };
  } else {
    menu[/*LANG*/"Disable"] = () => {
      settings.whitelist_disabled = true;
      updateSettings();
      showBLEMenu();
    };
  }

  if (settings.whitelist) settings.whitelist.forEach(function(d){
    menu[d.substr(0,17)] = function() {
      E.showPrompt(/*LANG*/'Remove\n'+d).then((v) => {
        if (v) {
          settings.whitelist.splice(settings.whitelist.indexOf(d),1);
          updateSettings();
        }
        setTimeout(showWhitelistMenu, 50);
      });
    }
  });
  menu[/*LANG*/'Add Device']=function() {
    E.showAlert(/*LANG*/"Connect device\nto add to\nwhitelist",/*LANG*/"Whitelist").then(function() {
      NRF.removeAllListeners('connect');
      showWhitelistMenu();
    });
    NRF.removeAllListeners('connect');
    NRF.on('connect', function(addr) {
      if (!settings.whitelist) settings.whitelist=[];
      delete settings.whitelist_disabled;
      if (NRF.resolveAddress !== undefined) {
        let resolvedAddr = NRF.resolveAddress(addr);
        if (resolvedAddr !== undefined) {
          addr = resolvedAddr + " (resolved)";
        }
      }
      settings.whitelist.push(addr);
      updateSettings();
      NRF.removeAllListeners('connect');
      showWhitelistMenu();
    });
  };
  E.showMenu(menu);
}

function showLCDMenu() {
  // converts g to Espruino internal unit
  function gToInternal(g) { return g * 8192; }
  // converts Espruino internal unit to g
  function internalToG(u) { return u / 8192; }

  var rotNames = [/*LANG*/"No",/*LANG*/"Rotate CW",/*LANG*/"Left Handed",/*LANG*/"Rotate CCW",/*LANG*/"Mirror"];

  const lcdMenu = {
    '': { 'title': 'LCD' },
    '< Back': ()=>showSystemMenu(),
  };
  if (BANGLEJS2)
    Object.assign(lcdMenu, {
    /*LANG*/'Calibrate': () => showTouchscreenCalibration()
    });
  Object.assign(lcdMenu, {
    /*LANG*/'LCD Brightness': {
      value: settings.brightness,
      min: 0.1,
      max: 1,
      step: 0.1,
      onchange: v => {
        settings.brightness = v || 1;
        updateSettings();
        Bangle.setLCDBrightness(settings.brightness);
      }
    },
    /*LANG*/'LCD Timeout': {
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
    /*LANG*/'Rotate': {
      value: 0|settings.rotate,
      min: 0,
      max: rotNames.length-1,
      format: v=> rotNames[v],
      onchange: v => {
        settings.rotate = 0 | v;
        updateSettings();
        g.setRotation(settings.rotate&3,settings.rotate>>2).clear();
        Bangle.drawWidgets();
      }
    }
  });

  if (BANGLEJS2) {
    Object.assign(lcdMenu, {
      /*LANG*/'Wake on Button': {
        value: !!settings.options.wakeOnBTN1,
        onchange: () => {
          settings.options.wakeOnBTN1 = !settings.options.wakeOnBTN1;
          updateOptions();
        }
      },
      /*LANG*/'Wake on Tap': {
        value: !!settings.options.wakeOnTouch,
        onchange: () => {
          settings.options.wakeOnTouch = !settings.options.wakeOnTouch;
          updateOptions();
        }
      }
    });
    if (process.env.VERSION.replace("v",0)>=2020)
      Object.assign(lcdMenu, {
        /*LANG*/'Wake on Double Tap': {
          value: !!settings.options.wakeOnDoubleTap,
          onchange: () => {
            settings.options.wakeOnDoubleTap = !settings.options.wakeOnDoubleTap;
            updateOptions();
          }
        }
      });
  } else
    Object.assign(lcdMenu, {
     /*LANG*/'Wake on BTN1': {
      value: !!settings.options.wakeOnBTN1,
      onchange: () => {
        settings.options.wakeOnBTN1 = !settings.options.wakeOnBTN1;
        updateOptions();
      }
    },
    /*LANG*/'Wake on BTN2': {
      value: !!settings.options.wakeOnBTN2,
      onchange: () => {
        settings.options.wakeOnBTN2 = !settings.options.wakeOnBTN2;
        updateOptions();
      }
    },
    /*LANG*/'Wake on BTN3': {
      value: !!settings.options.wakeOnBTN3,
      onchange: () => {
        settings.options.wakeOnBTN3 = !settings.options.wakeOnBTN3;
        updateOptions();
      }
    },
    /*LANG*/'Wake on Touch': {
      value: !!settings.options.wakeOnTouch,
      onchange: () => {
        settings.options.wakeOnTouch = !settings.options.wakeOnTouch;
        updateOptions();
      }
    }});
  Object.assign(lcdMenu, {
    /*LANG*/'Wake on FaceUp': {
      value: !!settings.options.wakeOnFaceUp,
      onchange: () => {
        settings.options.wakeOnFaceUp = !settings.options.wakeOnFaceUp;
        updateOptions();
      }
    },
    /*LANG*/'Wake on Twist': {
      value: !!settings.options.wakeOnTwist,
      onchange: () => {
        settings.options.wakeOnTwist = !settings.options.wakeOnTwist;
        updateOptions();
      }
    },
    /*LANG*/'Twist Threshold': {
      value: internalToG(settings.options.twistThreshold),
      min: -0.5,
      max: 0.5,
      step: 0.01,
      onchange: v => {
        settings.options.twistThreshold = gToInternal(v || 0.1);
        updateOptions();
      }
    },
    /*LANG*/'Twist Max Y': {
      value: settings.options.twistMaxY,
      min: -1500,
      max: 1500,
      step: 100,
      onchange: v => {
        settings.options.twistMaxY = v || -800;
        updateOptions();
      }
    },
    /*LANG*/'Twist Timeout': {
      value: settings.options.twistTimeout,
      min: 0,
      max: 2000,
      step: 100,
      onchange: v => {
        settings.options.twistTimeout = v || 1000;
        updateOptions();
      }
    }
  });

  return E.showMenu(lcdMenu)
}

function showLocaleMenu() {
  const localemenu = {
    '': { 'title': /*LANG*/'Locale' },
    '< Back': ()=>showSystemMenu(),
    /*LANG*/'Time Zone': {
      value: settings.timezone,
      format: v => (v > 0 ? "+" : "") + v,
      min: -11,
      max: 13,
      step: 0.5,
      onchange: v => {
        settings.timezone = v || 0;
        updateSettings();
      }
    },
    /*LANG*/'Time Format': {
      value: !!settings["12hour"],
      format: v => v ? "12h" : "24h",
      onchange: v => {
        settings["12hour"] = v;
        updateSettings();
      }
    },
    /*LANG*/'Start Week On': {
      value: settings["firstDayOfWeek"] || 0,
      min: 0, // Sunday
      max: 1, // Monday
      format: v => require("date_utils").dow(v, 1),
      onchange: v => {
        settings["firstDayOfWeek"] = v;
        updateSettings();
      },
    }
  };
  return E.showMenu(localemenu);
}

function showUtilMenu() {
  var menu = {
    '': { 'title': /*LANG*/'Utilities' },
    '< Back': ()=>showMainMenu(),
    /*LANG*/'Debug': {
      value: E.clip(0|settings.log,0,3),
      min: 0,
      max: 3,
      format: v => [/*LANG*/"Off",/*LANG*/"Display",/*LANG*/"Log", /*LANG*/"Both"][E.clip(0|v,0,3)],
      onchange: v => {
        settings.log = v;
        updateSettings();
      }
    },
    /*LANG*/'Compact Storage': () => {
      E.showMessage(/*LANG*/"Compacting...\nTakes approx\n1 minute",{title:/*LANG*/"Storage"});
      storage.compact();
      showUtilMenu();
    },
    /*LANG*/'Rewrite Settings': () => {
      storage.write(".boot0","eval(require('Storage').read('bootupdate.js'));");
      load("setting.app.js");
    },
    /*LANG*/'Flatten Battery': () => {
      E.showMessage(/*LANG*/'Flattening battery - this can take hours.\nLong-press button to cancel.');
      Bangle.setLCDTimeout(0);
      Bangle.setLCDPower(1);
      Bangle.setLCDBrightness(1);
      if (Bangle.setGPSPower) Bangle.setGPSPower(1,"flat");
      if (Bangle.setHRMPower) Bangle.setHRMPower(1,"flat");
      if (Bangle.setCompassPower) Bangle.setCompassPower(1,"flat");
      if (Bangle.setBarometerPower) Bangle.setBarometerPower(1,"flat");
      setInterval(function() {
        var i=1000;while (i--);
      }, 1);
    }
  };
  if (BANGLEJS2)
    menu[/*LANG*/'Calibrate Battery'] = () => {
      E.showPrompt(/*LANG*/"Is the battery fully charged?",{title:/*LANG*/"Calibrate",back:showUtilMenu}).then(ok => {
        if (ok) {
          var s=storage.readJSON("setting.json");
          s.batFullVoltage = (analogRead(D3)+analogRead(D3)+analogRead(D3)+analogRead(D3))/4;
          storage.writeJSON("setting.json",s);
          E.showAlert(/*LANG*/"Calibrated!").then(() => load("setting.app.js"));
        } else {
          E.showAlert(/*LANG*/"Please charge Bangle.js for 3 hours and try again").then(() => load("setting.app.js"));
        }
      });
    };
  menu[/*LANG*/'Reset Settings'] = () => {
      E.showPrompt(/*LANG*/'Reset to Defaults?',{title:/*LANG*/"Settings",back:showUtilMenu}).then((v) => {
        if (v) {
          E.showMessage(/*LANG*/'Resetting');
          resetSettings();
          setTimeout(showMainMenu, 50);
        } else showUtilMenu();
      });
    };
  menu[/*LANG*/"Turn Off"] = () => {
    E.showPrompt(/*LANG*/"Are you sure? Alarms and timers won't fire", {
      title:/*LANG*/"Turn Off",back:showUtilMenu
    }).then((confirmed) => {
      if (confirmed) {
        E.showMessage(/*LANG*/"See you\nlater!", /*LANG*/"Goodbye");
        setTimeout(() => {
          // clear the screen so when the user will turn on the watch they'll see
          // an empty screen instead of the latest displayed screen
          E.showMessage();
          g.clear(true);

          Bangle.softOff ? Bangle.softOff() : Bangle.off();
        }, 2500);
      } else {
        showUtilMenu();
      }
    });
  };
  if (Bangle.factoryReset) {
    menu[/*LANG*/'Factory Reset'] = ()=>{
      E.showPrompt(/*LANG*/'This will remove everything!',{title:/*LANG*/"Factory Reset",back:showUtilMenu}).then((v) => {
        if (v) {
          var n = ((Math.random()*4)&3) + 1;
          E.showPrompt(/*LANG*/"To confirm, please press "+n,{
            title:/*LANG*/"Factory Reset",
            buttons : {"1":1,"2":2,"3":3,"4":4},
            back:showUtilMenu
          }).then(function(v) {
            if (v==n) {
              E.showMessage();
              Terminal.setConsole();
              Bangle.factoryReset();
            } else {
              showUtilMenu();
            }
          });
        } else showUtilMenu();
      });
    }
  }

  return E.showMenu(menu);
}

function makeConnectable() {
  try { NRF.wake(); } catch (e) { }
  Bluetooth.setConsole(1);
  NRF.ignoreWhitelist = 1;
  var name = "Bangle.js " + NRF.getAddress().substr(-5).replace(":", "");
  E.showPrompt(name + /*LANG*/"\nStay Connectable?", { title: /*LANG*/"Connectable" }).then(r => {
    if (settings.ble != r) {
      settings.ble = r;
      updateSettings();
    }
    if (!r) try { NRF.sleep(); } catch (e) { }
    delete NRF.ignoreWhitelist;
    showMainMenu();
  });
}
function showClockMenu() {
  var clockApps = storage.list(/\.info$/)
    .map(app => {var a=storage.readJSON(app, 1);return (a&&a.type == "clock")?a:undefined})
    .filter(app => app) // filter out any undefined apps
    .sort((a, b) => a.sortorder - b.sortorder);
  const clockMenu = {
    '': {
      'title': /*LANG*/'Select Clock',
    },
    '< Back': ()=>showSystemMenu(),
  };
  clockApps.forEach((app, index) => {
    var label = app.name;
    if ((!settings.clock && index === 0) || (settings.clock === app.src)) {
      label = "* " + label;
    }
    clockMenu[label] = () => {
      settings.clock = app.src;
      settings.clockHasWidgets = storage.read(app.src).includes("Bangle.loadWidgets");
      updateSettings();
      showMainMenu();
    };
  });
  if (clockApps.length === 0) {
    clockMenu[/*LANG*/"No Clocks Found"] = () => { };
  }
  return E.showMenu(clockMenu);
}
function showLauncherMenu() {
  var launcherApps = storage.list(/\.info$/)
    .map(app => {var a=storage.readJSON(app, 1);return (a&&a.type == "launch")?a:undefined})
    .filter(app => app) // filter out any undefined apps
    .sort((a, b) => a.sortorder - b.sortorder);
  const launcherMenu = {
    '': {
      'title': /*LANG*/'Select Launcher',
    },
    '< Back': ()=>showSystemMenu(),
  };
  launcherApps.forEach((app, index) => {
    var label = app.name;
    if ((!settings.launcher && index === 0) || (settings.launcher === app.src)) {
      label = "* " + label;
    }
    launcherMenu[label] = () => {
      settings.launcher = app.src;
      updateSettings();
      showMainMenu();
    };
  });
  if (launcherApps.length === 0) {
    launcherMenu[/*LANG*/"No Launchers Found"] = () => { };
  }
  return E.showMenu(launcherMenu);
}

function showSetTimeMenu() {
  let d = new Date();
  const timemenu = {
    '': { 'title': /*LANG*/'Date & Time' },
    '< Back': function () {
      setTime(d.getTime() / 1000);
      showSystemMenu();
    },
    /*LANG*/'Day': {
      value: d.getDate(),
      onchange: function (v) {
        this.value = ((v+30)%31)+1;
        d.setDate(this.value);
      }
    },
    /*LANG*/'Month': {
      value: d.getMonth() + 1,
      format: v => require("date_utils").month(v),
      onchange: function (v) {
        this.value = ((v+11)%12)+1;
        d.setMonth(this.value - 1);
      }
    },
    /*LANG*/'Year': {
      value: d.getFullYear(),
      min: 2019,
      max: 2100,
      onchange: function (v) {
        d.setFullYear(v);
      }
    },
    /*LANG*/'Hour': {
      value: d.getHours(),
      onchange: function (v) {
        this.value = (v+24)%24;
        d.setHours(this.value);
      }
    },
    /*LANG*/'Minute': {
      value: d.getMinutes(),
      onchange: function (v) {
        this.value = (v+60)%60;
        d.setMinutes(this.value);
      }
    },
    /*LANG*/'Second': {
      value: d.getSeconds(),
      onchange: function (v) {
        this.value = (v+60)%60;
        d.setSeconds(this.value);
      }
    }
  };
  return E.showMenu(timemenu);
}

function showAppSettingsMenu() {
  let appmenu = {
    '': { 'title': /*LANG*/'App Settings' },
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
    appmenu[/*LANG*/'No app has settings'] = () => { };
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
    console.log(`${app.name} settings error:`, e);
    return showError(/*LANG*/'Error in settings');
  }
  if (typeof appSettings !== "function") {
    return showError(/*LANG*/'Invalid settings');
  }
  try {
    // pass showAppSettingsMenu as "back" argument
    appSettings(()=>showAppSettingsMenu());
  } catch (e) {
    console.log(`${app.name} settings error:`, e);
    return showError(/*LANG*/'Error in settings');
  }
}

function showTouchscreenCalibration() {
  Bangle.setUI();
  require('widget_utils').hide();
  // disable touchscreen calibration (passed coords right through)
  Bangle.setOptions({touchX1: 0, touchY1: 0, touchX2: g.getWidth(), touchY2: g.getHeight() });

  var P = 32;
  var corners = [
    [P,P],
    [g.getWidth()-P,P],
    [g.getWidth()-P,g.getHeight()-P],
    [P,g.getHeight()-P],
  ];
  var currentCorner = 0;
  var currentTry = 0;
  var pt = {
    x1 : 0, y1 : 0, x2 : 0, y2 : 0
  };

  function showTapSpot() {
    var spot = corners[currentCorner];
    g.clear(1);
    g.drawLine(spot[0]-32,spot[1],spot[0]+32,spot[1]);
    g.drawLine(spot[0],spot[1]-32,spot[0],spot[1]+32);
    g.drawCircle(spot[0],spot[1], 16);
    var tapsLeft = (2-currentTry)*4+(4-currentCorner);
    g.setFont("6x8:2").setFontAlign(0,0).drawString(tapsLeft+/*LANG*/" taps\nto go", g.getWidth()/2, g.getHeight()/2);
  }

  function calcCalibration() {
    g.clear(1);
    // we should now have 6 of each tap in 'pt'
    pt.x1 /= 6;
    pt.y1 /= 6;
    pt.x2 /= 6;
    pt.y2 /= 6;
    // work out final values
    var calib = {
      x1 : Math.round(pt.x1 - (pt.x2-pt.x1)*P/(g.getWidth()-P*2)),
      y1 : Math.round(pt.y1 - (pt.y2-pt.y1)*P/(g.getHeight()-P*2)),
      x2 : Math.round(pt.x2 + (pt.x2-pt.x1)*P/(g.getWidth()-P*2)),
      y2 : Math.round(pt.y2 + (pt.y2-pt.y1)*P/(g.getHeight()-P*2))
    };
    var dx = calib.x2-calib.x1;
    var dy = calib.y2-calib.y1;
    if(dx<100 || dx>280 || dy<100 || dy>280) {
      g.setFont("6x8:2").setFontAlign(0,0).drawString(/*LANG*/"Out of Range.\nPlease\ntry again", g.getWidth()/2, g.getHeight()/2);
    } else {
      Bangle.setOptions({
        touchX1: calib.x1, touchY1: calib.y1, touchX2: calib.x2, touchY2: calib.y2
      });
      var s = storage.readJSON("setting.json",1)||{};
      s.touch = calib;
      storage.writeJSON("setting.json",s);
      g.setFont("6x8:2").setFontAlign(0,0).drawString(/*LANG*/"Calibrated!", g.getWidth()/2, g.getHeight()/2);
    }
    // now load the main menu again
    setTimeout(showLCDMenu, 500);
  }

  function touchHandler(_,e) {
    E.stopEventPropagation&&E.stopEventPropagation();
    var spot = corners[currentCorner];
    // store averages
    if (spot[0]*2 < g.getWidth())
      pt.x1 += e.x;
    else
      pt.x2 += e.x;
    if (spot[1]*2 < g.getHeight())
      pt.y1 += e.y;
    else
      pt.y2 += e.y;
    // go to next corner
    currentCorner++;
    if (currentCorner>=corners.length) {
      currentCorner = 0;
      currentTry++;
      if (currentTry==3) {
        Bangle.removeListener('touch', touchHandler);
        return calcCalibration();
      }
    }
    showTapSpot();
  }
  Bangle.prependListener?Bangle.prependListener('touch',touchHandler):Bangle.on('touch',touchHandler);

  showTapSpot();
}

showMainMenu();
}
