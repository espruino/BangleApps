(function(back) {
  const SETTINGS_FILE = 'edgeclk.settings.json';
  const storage = require('Storage');

  const settings = {
    buzzOnCharge: true,
    monthFirst: true,
    twentyFourH: true,
    showAmPm: false,
    showSeconds: true,
    showWeather: false,
    stepGoal: 10000,
    stepBar: true,
    weekBar: true,
    mondayFirst: true,
    dayBar: true,
    redrawOnStep: false,
  };

  const saved_settings = storage.readJSON(SETTINGS_FILE, true);
  if (saved_settings) {
    for (const key in saved_settings) {
      if (!settings.hasOwnProperty(key)) continue;
      settings[key] = saved_settings[key];
    }
  }

  let save = function() {
    storage.write(SETTINGS_FILE, settings);
  }

  E.showMenu({
    '': { 'title': 'Edge Clock' },
    '< Back': back,
    'Charge Buzz': {
      value: settings.buzzOnCharge,
      onchange: () => {
        settings.buzzOnCharge = !settings.buzzOnCharge;
        save();
      },
    },
    'Month First': {
      value: settings.monthFirst,
      onchange: () => {
        settings.monthFirst = !settings.monthFirst;
        save();
      },
    },
    '24h Clock': {
      value: settings.twentyFourH,
      onchange: () => {
        settings.twentyFourH = !settings.twentyFourH;
        save();
      },
    },
    'Show AM/PM': {
      value: settings.showAmPm,
      onchange: () => {
        settings.showAmPm = !settings.showAmPm;
        // TODO can this be visually changed?
        if (settings.showAmPm && settings.showSeconds) settings.showSeconds = false;
        if (settings.showAmPm && settings.showWeather) settings.showWeather = false;
        save();
      },
    },
    'Show Seconds': {
      value: settings.showSeconds,
      onchange: () => {
        settings.showSeconds = !settings.showSeconds;
        // TODO can this be visually changed?
        if (settings.showSeconds && settings.showAmPm) settings.showAmPm = false;
        if (settings.showSeconds && settings.showWeather) settings.showWeather = false;
        save();
      },
    },
    'Show Weather': {
      value: settings.showWeather,
      onchange: () => {
        settings.showWeather = !settings.showWeather;
        // TODO can this be visually changed?
        if (settings.showWeather && settings.showAmPm) settings.showAmPm = false;
        if (settings.showWeather && settings.showSeconds) settings.showSeconds = false;
        save();
      },
    },
    'Step Goal': {
      value: settings.stepGoal,
      min: 250,
      max: 50000,
      step: 250,
      onchange: v => {
        settings.stepGoal = v;
        save();
      }
    },
    'Step Progress': {
      value: settings.stepBar,
      onchange: () => {
        settings.stepBar = !settings.stepBar;
        save();
      }
    },
    'Week Progress': {
      value: settings.weekBar,
      onchange: () => {
        settings.weekBar = !settings.weekBar;
        save();
      },
    },
    'Week Start': {
      value: settings.mondayFirst,
      format: () => settings.mondayFirst ? 'Monday' : 'Sunday',
      onchange: () => {
        settings.mondayFirst = !settings.mondayFirst;
        save();
      },
    },
    'Day Progress': {
      value: settings.dayBar,
      onchange: () => {
        settings.dayBar = !settings.dayBar;
        save();
      },
    },
    'Live steps': {
      value: settings.redrawOnStep,
      onchange: () => {
        settings.redrawOnStep = !settings.redrawOnStep;
        save();
      },
    },
  });
})
