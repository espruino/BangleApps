(function(back) {
    const SETTINGS_FILE = "line_clock.setting.json";

    // initialize with default settings...
    const storage = require('Storage')
    let settings = {
      showLock: true,
      showMinute: true,
      showSteps: true,
      showStepsK: true,
      showBattery: true,
      batteryWarn: true,
      showHrm: true,
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
      settings[key] = saved_settings[key]
    }

    function save() {
      storage.write(SETTINGS_FILE, settings)
    }

    E.showMenu({
      '': { 'title': 'Line Clock' },
      '< Back': back,
      'Show Lock': {
        value: settings.showLock,
        onchange: () => {
          settings.showLock = !settings.showLock;
          save();
        },
      },
      'Show Minute': {
        value: settings.showMinute,
        onchange: () => {
          settings.showMinute = !settings.showMinute;
          save();
        },
      },
      'Show Steps': {
        value: settings.showSteps,
        onchange: () => {
          settings.showSteps = !settings.showSteps;
          save();
        },
      },
      'Steps "k" label': {
        value: settings.showStepsK,
        onchange: () => {
          settings.showStepsK = !settings.showStepsK;
          save();
        },
      },
      'Show Battery': {
        value: settings.showBattery,
        onchange: () => {
          settings.showBattery = !settings.showBattery;
          save();
        },
      },
      'Dynamic Battery Color': {
        value: settings.batteryWarn,
        onchange: () => {
          settings.batteryWarn = !settings.batteryWarn;
          save();
        },
      },
      'Show Heart Rate': {
        value: settings.showHrm,
        onchange: () => {
          settings.showHrm = !settings.showHrm;
          save();
        },
      }
    });
  })
