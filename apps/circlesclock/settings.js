(function(back) {
  const SETTINGS_FILE = "circlesclock.json";
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }
  E.showMenu({
    '': { 'title': 'circlesclock' },
    'max heartrate': {
      value: "maxHR" in settings ? settings.maxHR : 200,
      min: 20,
      max : 250,
      step: 10,
      format: x => {
        return x;
      },
      onchange: x => save('maxHR', x),
    },
    'step goal': {
      value: "stepGoal" in settings ? settings.stepGoal : 10000,
      min: 2000,
      max : 50000,
      step: 2000,
      format: x => {
        return x;
      },
      onchange: x => save('stepGoal', x),
    },
    'battery warn lvl': {
      value: "batteryWarn" in settings ? settings.batteryWarn : 30,
      min: 10,
      max : 100,
      step: 10,
      format: x => {
        return x + '%';
      },
      onchange: x => save('batteryWarn', x),
    },
    '< Back': back,
  });
});
