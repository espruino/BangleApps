(function(back) {
  const SETTINGS_FILE = "circlesclock.json";
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }
  var valuesCircleTypes = ["steps", "stepsDist", "hr", "battery"];
  var namesCircleTypes = ["steps", "step distance", "heart", "battery"];
  E.showMenu({
    '': { 'title': 'circlesclock' },
    'min heartrate': {
      value: "minHR" in settings ? settings.minHR : 40,
      min: 0,
      max : 250,
      step: 10,
      format: x => {
        return x;
      },
      onchange: x => save('minHR', x),
    },
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
    'show widgets': {
      value: "showWidgets" in settings ? settings.showWidgets : false,
      format: () => (settings.showWidgets ? 'Yes' : 'No'),
      onchange: () => {
        settings.showWidgets = !settings.showWidgets;
        save('showWidgets', settings.showWidgets);
      },
    },
    'Left circle': {
      value: Math.max(0,0 | valuesCircleTypes.indexOf(settings.circle1)),
      min: 0, max: 3,
      format: v => namesCircleTypes[v],
      onchange: v => {
        settings.circle1 = valuesCircleTypes[v];
        save('circle1', settings.circle1);
      }
    },
    'Middle circle': {
      value: Math.max(0,0 | valuesCircleTypes.indexOf(settings.circle2)),
      min: 0, max: 3,
      format: v => namesCircleTypes[v],
      onchange: v => {
        settings.circle2 = valuesCircleTypes[v];
        save('circle2', settings.circle2);
      }
    },
    'Right circle': {
      value: Math.max(0,0 | valuesCircleTypes.indexOf(settings.circle3)),
      min: 0, max: 3,
      format: v => namesCircleTypes[v],
      onchange: v => {
        settings.circle3 = valuesCircleTypes[v];
        save('circle3', settings.circle3);
      }
    },
    '< Back': back,
  });
});
