(function(back) {
  var systemsettings = require("Storage").readJSON("setting.json") || {};

  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings() {
    settings = Object.assign(
      require('Storage').readJSON("powermanager.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {}
    );
  }

  var FILE = "powermanager.json";
  var settings;
  readSettings();

  var mainmenu = {
    '': {
      'title': 'Power Manager'
    },
    '< Back': back,
    'Monotonic percentage': {
      value: !!settings.forceMonoPercentage,
      onchange: v => {
        writeSettings("forceMonoPercentage", v);
      }
    },
    'Monotonic voltage': {
      value: !!settings.forceMonoVoltage,
      onchange: v => {
        writeSettings("forceMonoVoltage", v);
      }
    },
    'Charge warning': function() {
      E.showMenu(submenu_chargewarn);
    },
    'Calibrate': function() {
      E.showMenu(submenu_calibrate);
    }
  };


  function roundToDigits(number, stepsize) {
    return Math.round(number / stepsize) * stepsize;
  }

  function getCurrentVoltageDirect() {
    return (analogRead(D3) + analogRead(D3) + analogRead(D3) + analogRead(D3)) / 4;
  }

  var stepsize = 0.0002;
  var full = 0.32;

  function getInitialCalibrationOffset() {
    return roundToDigits(systemsettings.batFullVoltage - full, stepsize) || 0;
  }


  var submenu_calibrate = {
    '': {
      title: "Calibrate"
    },
    '< Back': function() {
      E.showMenu(mainmenu);
    },
    'Offset': {
      min: -0.05,
      max: 0.05,
      step: stepsize,
      value: getInitialCalibrationOffset(),
      format: v => roundToDigits(v, stepsize).toFixed((""+stepsize).length - 2),
      onchange: v => {
        print(typeof v);
        systemsettings.batFullVoltage = v + full;
        require("Storage").writeJSON("setting.json", systemsettings);
      }
    },
    'Auto': function() {
      var newVoltage = getCurrentVoltageDirect();
      E.showAlert("Please charge fully before auto setting").then(() => {
        E.showPrompt("Set current charge as full").then((r) => {
          if (r) {
            systemsettings.batFullVoltage = newVoltage;
            require("Storage").writeJSON("setting.json", systemsettings);
            //reset value shown in menu to the newly set one
            submenu_calibrate.Offset.value = getInitialCalibrationOffset();
            E.showMenu(mainmenu);
          }
        });
      });
    },
    'Clear': function() {
      E.showPrompt("Clear charging offset?").then((r) => {
        if (r) {
          delete systemsettings.batFullVoltage;
          require("Storage").writeJSON("setting.json", systemsettings);
          //reset value shown in menu to the newly set one
          submenu_calibrate.Offset.value = getInitialCalibrationOffset();
          E.showMenu(mainmenu);
        }
      });
    }
  };

  var submenu_chargewarn = {
    '': {
      title: "Charge warning"
    },
    '< Back': function() {
      E.showMenu(mainmenu);
    },
    'Enabled': {
      value: !!settings.warnEnabled,
      format: v => settings.warnEnabled ? "On" : "Off",
      onchange: v => {
        writeSettings("warnEnabled", v);
      }
    },
    'Percentage': {
      min: 80,
      max: 100,
      step: 2,
      value: settings.warn,
      format: v => v + "%",
      onchange: v => {
        writeSettings("warn", v);
      }
    }
  };

  E.showMenu(mainmenu);
})
