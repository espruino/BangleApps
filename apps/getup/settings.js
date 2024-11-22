// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'getup.settings.json';

  // initialize with default settings...
  let s = {
    'sitTime' : 20,
    'moveTime' : 1
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
    };
  }

  const menu = {
    '': { 'title': 'Get Up' },
    '< Back': back,
    'Sit time (min)': {
      value: s.sitTime,
      min: 0,
      max: 10000,
      step: 1,
      onchange: save('sitTime'),
    },
    'Move time (min)': {
      value: s.moveTime,
      min: 0,
      max: 5000,
      step: 1,
      onchange: save('moveTime'),
    },
  };
  E.showMenu(menu);
})
