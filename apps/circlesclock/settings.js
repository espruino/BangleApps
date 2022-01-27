(function(back) {
  const SETTINGS_FILE = "circlesclock.json";
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }

  const valuesCircleTypes = ["steps", "stepsDist", "hr", "battery", "weather", "sunprogress", "empty", "temperature", "pressure", "altitude"];
  const namesCircleTypes = ["steps", "distance", "heart", "battery", "weather", "sun progress", "empty", "temperature", "pressure", "altitude"];

  const weatherData = ["humidity", "wind", "empty"];

  E.showMenu({
    '': { 'title': 'circlesclock' },
    '< Back': back,
    'min heartrate': {
      value: "minHR" in settings ? settings.minHR : 40,
      min: 0,
      max : 250,
      step: 5,
      format: x => {
        return x;
      },
      onchange: x => save('minHR', x),
    },
    'max heartrate': {
      value: "maxHR" in settings ? settings.maxHR : 200,
      min: 20,
      max : 250,
      step: 5,
      format: x => {
        return x;
      },
      onchange: x => save('maxHR', x),
    },
    'hr confidence': {
      value: "confidence" in settings ? settings.confidence : 0,
      min: 0,
      max : 100,
      step: 10,
      format: x => {
        return x;
      },
      onchange: x => save('confidence', x),
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
    'step length': {
      value: "stepLength" in settings ? settings.stepLength : 0.8,
      min: 0.1,
      max : 1.5,
      step: 0.01,
      format: x => {
        return x;
      },
      onchange: x => save('stepLength', x),
    },
    'step dist goal': {
      value: "stepDistanceGoal" in settings ? settings.stepDistanceGoal : 8000,
      min: 2000,
      max : 30000,
      step: 1000,
      format: x => {
        return x;
      },
      onchange: x => save('stepDistanceGoal', x),
    },
    'battery warn': {
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
      onchange: x => save('showWidgets', x),
    },
    'weather circle': {
      value: settings.weatherCircleData ? weatherData.indexOf(settings.weatherCircleData) : 0,
      min: 0, max: 2,
      format: v => weatherData[v],
      onchange: x => save('weatherCircleData', weatherData[x]),
    },
    'circle count': {
      value: "circleCount" in settings ? settings.circleCount : 3,
      min: 3,
      max : 4,
      step: 1,
      onchange: x => save('circleCount', x),
    },
    'circle1': {
      value: settings.circle1 ? valuesCircleTypes.indexOf(settings.circle1) : 0,
      min: 0, max: valuesCircleTypes.length,
      format: v => namesCircleTypes[v],
      onchange: x => save('circle1', valuesCircleTypes[x]),
    },
    'circle2': {
      value: settings.circle2 ? valuesCircleTypes.indexOf(settings.circle2) : 2,
      min: 0, max: valuesCircleTypes.length,
      format: v => namesCircleTypes[v],
      onchange: x => save('circle2', valuesCircleTypes[x]),
    },
    'circle3': {
      value: settings.circle3 ? valuesCircleTypes.indexOf(settings.circle3) : 3,
      min: 0, max: valuesCircleTypes.length,
      format: v => namesCircleTypes[v],
      onchange: x => save('circle3', valuesCircleTypes[x]),
    },
    'circle4': {
      value: settings.circle4 ? valuesCircleTypes.indexOf(settings.circle4) : 4,
      min: 0, max: valuesCircleTypes.length,
      format: v => namesCircleTypes[v],
      onchange: x => save('circle4', valuesCircleTypes[x]),
    }
  });
});
