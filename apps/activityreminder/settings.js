(function(back) {
  var FILE = "activityreminder.settings.json";
  // Load settings
  var settings = Object.assign({
    enabled: true,
    startHour: 9,
    endHour: 20,
    maxInnactivityMin: 30,
    dismissDelayMin: 15,
    minsteps: 50,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
      "" : { "title" : "Activity Reminder" },
      "< Back" : () => back(),
      'Enable': {
        value: !!settings.enabled,
        format: v => v?"Yes":"No",
        onchange: v => {
          settings.enabled = v;
          writeSettings();
        }
      },
      'Start hour': {
        value: 9|settings.startHour,
        min: 0, max: 24,
        onchange: v => {
          settings.startHour = v;
          writeSettings();
        }
     },
     'End hour': {
        value: 20|settings.endHour,
        min: 0, max: 24,
        onchange: v => {
          settings.endHour = v;
          writeSettings();
        }
     },
     'Max innactivity': {
        value: 30|settings.maxInnactivityMin,
        min: 15, max: 60,
        onchange: v => {
          settings.maxInnactivityMin = v;
          writeSettings();
        }
     },
     'Dismiss delay': {
        value: 15|settings.dismissDelayMin,
        min: 5, max: 15,
        onchange: v => {
          settings.dismissDelayMin = v;
          writeSettings();
        }
     },
     'Min steps': {
        value: 50|settings.minSteps,
        min: 10, max: 500,
        onchange: v => {
          settings.minSteps = v;
          writeSettings();
        }
     }
  });
})
