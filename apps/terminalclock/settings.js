(function(back) {
  var FILE = "terminalclock.json";
  // Load settings
  var settings = Object.assign({
    HRMinConfidence: 50,
    showDate: "Yes",
    showHRM: "Yes",
    showActivity: "Yes",
    showStepCount: "Yes",
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Terminal Clock" },
    "< Back" : () => back(),
    'HR confidence': {
      value: 50|settings.HRMinConfidence,  // 0| converts undefined to 0
      min: 0, max: 100,
      onchange: v => {
        settings.HRMinConfidence = v;
        writeSettings();
      }
   },
   'Show date': {
      value: !!settings.showDate,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showDate = v;
        writeSettings();
      }
    },
    'Show HRM': {
      value: !!settings.showHRM,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showHRM = v;
        writeSettings();
      }
    },
    'Show Activity': {
      value: !!settings.showActivity,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showActivity = v;
        writeSettings();
      }
    },
    'Show Steps': {
      value: !!settings.showStepCount,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.showStepCount = v;
        writeSettings();
      }
    }
  });
})
