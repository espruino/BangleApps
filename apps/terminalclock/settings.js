(function(back) {
  var FILE = "terminalclock.json";
  // Load settings
  var settings = Object.assign({
    HRMinConfidence: 50,
    showDate: true,
    showAltitude: process.env.HWVERSION != 1 ? true : false,
    showHRM: true,
    showActivity: true,
    showStepCount: true,
    powerSaving: true,
    PowerOnInterval: 15,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  var menu = {
    "" : { "title" : "Terminal Clock" },
    "< Back" : () => back(),
    'HR confidence': {
      value: settings.HRMinConfidence,
      min: 0, max: 100,
      onchange: v => {
        settings.HRMinConfidence = v;
        writeSettings();
      }
   },
   'Show date': {
      value: settings.showDate,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showDate = v;
        writeSettings();
      }
    },
    'Show Altitude': {
      value: settings.showAltitude,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showAltitude = v;
        writeSettings();
      }
    },
    'Show HRM': {
      value: settings.showHRM,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showHRM = v;
        writeSettings();
      }
    },
    'Show Activity': {
      value: settings.showActivity,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showActivity = v;
        writeSettings();
      }
    },
    'Show Steps': {
      value: settings.showStepCount,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showStepCount = v;
        writeSettings();
      }
    },
    'Power saving': {
      value: settings.powerSaving,
      format: v => v?"On":"Off",
      onchange: v => {
        settings.powerSaving = v;
        writeSettings();
      }
    },
    'Power on interval': {
      value: settings.PowerOnInterval,
      min: 3, max: 60,
      onchange: v => {
        settings.PowerOnInterval = v;
        writeSettings();
      },
      format: x => {
          return x + " min";
      }
    }
  }
  if (process.env.HWVERSION == 1) {
    delete menu['Show Altitude']
  }
  E.showMenu(menu);
})