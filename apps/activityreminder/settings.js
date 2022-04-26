(function(back) {
  // Load settings
  var settings = require("activityreminder").loadSettings();

  // Show the menu
  E.showMenu({
      "" : { "title" : "Activity Reminder" },
      "< Back" : () => back(),
      'Enable': {
        value: settings.enabled,
        format: v => v?"Yes":"No",
        onchange: v => {
          settings.enabled = v;
          require("activityreminder").writeSettings(settings);
        }
      },
      'Start hour': {
        value: settings.startHour,
        min: 0, max: 24,
        onchange: v => {
          settings.startHour = v;
          require("activityreminder").writeSettings(settings);
        }
     },
     'End hour': {
        value: settings.endHour,
        min: 0, max: 24,
        onchange: v => {
          settings.endHour = v;
          require("activityreminder").writeSettings(settings);
        }
     },
     'Max inactivity': {
        value: settings.maxInnactivityMin,
        min: 15, max: 120,
        onchange: v => {
          settings.maxInnactivityMin = v;
          require("activityreminder").writeSettings(settings);
        },
        format: x => {
          return x + " min";
        }
     },
     'Dismiss delay': {
        value: settings.dismissDelayMin,
        min: 5, max: 15,
        onchange: v => {
          settings.dismissDelayMin = v;
          require("activityreminder").writeSettings(settings);
        },
        format: x => {
          return x + " min";
        }
     },
     'Min steps': {
        value: settings.minSteps,
        min: 10, max: 500,
        onchange: v => {
          settings.minSteps = v;
          require("activityreminder").writeSettings(settings);
        }
     }
  });
})
