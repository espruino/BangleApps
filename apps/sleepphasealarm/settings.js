(function(back) {
  const CONFIGFILE = "sleepphasealarm.json";
  // Load settings
  const config = Object.assign({
      logs: [], // array of length 31 with one entry for each day of month
      settings: {
          startBeforeAlarm: 0, // 0 = start immediately, 1..23 = start 1h..23h before alarm time
          disableAlarm: false,
      }
  }, require("Storage").readJSON(CONFIGFILE,1) || {});

  function writeSettings() {
    require('Storage').writeJSON(CONFIGFILE, config);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "SleepPhaseAlarm" },
    'Keep alarm enabled': {
      value: !!config.settings.disableAlarm,
      format: v => v?"No":"Yes",
      onchange: v => {
        config.settings.disableAlarm = v;
        writeSettings();
      }
    },   "< Back" : () => back(),
    'Run before alarm': {
      format: v => v === 0 ? 'disabled' : v+'h',
      value: config.settings.startBeforeAlarm,
      min: 0, max: 23,
      onchange: v => {
        config.settings.startBeforeAlarm = v;
        writeSettings();
      }
    },
  });
})
