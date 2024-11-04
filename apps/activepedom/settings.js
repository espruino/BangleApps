// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'activepedom.settings.json';
  const LINES = ['Steps', 'Distance', 'Hide'];

  // initialize with default settings...
  let s = {
    'cMaxTime' : 1100,
    'cMinTime' : 240,
    'stepThreshold' : 30,
    'intervalResetActive' : 30000,
    'stepSensitivity' : 80,
    'stepGoal' : 10000,
    'stepLength' : 75,
    'lineOne': LINES[0],
    'lineTwo': LINES[1],
  };
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  // creates a function to safe a specific setting, e.g.  save('color')(1)
  function save(key) {
    return function (value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
      //WIDGETS["activepedom"].draw();
    };
  }

  const menu = {
    '': { 'title': 'Active Pedometer' },
    '< Back': back,
    'Max time (ms)': {
      value: s.cMaxTime,
      min: 0,
      max: 10000,
      step: 100,
      onchange: save('cMaxTime'),
    },
    'Min time (ms)': {
      value: s.cMinTime,
      min: 0,
      max: 500,
      step: 10,
      onchange: save('cMinTime'),
    },
    'Step threshold': {
      value: s.stepThreshold,
      min: 0,
      max: 100,
      step: 1,
      onchange: save('stepThreshold'),
    },
    'Act.Res. (ms)': {
      value: s.intervalResetActive,
      min: 100,
      max: 100000,
      step: 1000,
      onchange: save('intervalResetActive'),
    },
    'Step sens.': {
      value: s.stepSensitivity,
      min: 0,
      max: 1000,
      step: 10,
      onchange: save('stepSensitivity'),
    },
    'Step goal': {
      value: s.stepGoal,
      min: 1000,
      max: 100000,
      step: 1000,
      onchange: save('stepGoal'),
    },
    'Step length (cm)': {
      value: s.stepLength,
      min: 1,
      max: 150,
      step: 1,
      onchange: save('stepLength'),
    },
    'Line One': {
      format: () => s.lineOne,
      onchange: function () {
        // cycles through options
        const oldIndex = LINES.indexOf(s.lineOne)
        const newIndex = (oldIndex + 1) % LINES.length
        s.lineOne = LINES[newIndex]
        save('lineOne')(s.lineOne)
      },
    },
    'Line Two': {
      format: () => s.lineTwo,
      onchange: function () {
        // cycles through options
        const oldIndex = LINES.indexOf(s.lineTwo)
        const newIndex = (oldIndex + 1) % LINES.length
        s.lineTwo = LINES[newIndex]
        save('lineTwo')(s.lineTwo)
      },
    },
  };
  E.showMenu(menu);
})
