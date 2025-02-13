// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'cprassist.settings.json';

  // initialize with default settings...
  let s = {
    'compression_count': 30,
    'breath_count': 2,
    'compression_rpm': 100,
    'breath_period_sec': 4
  };
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  // creates a function to safe a specific setting
  function save(key) {
    return function(value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
    };
  }

  const menu = {
    '': { 'title': 'CPR Assist' },
    '< Back': back,
    'chest compr.': {
      value: s.compression_count,
      min: 1,
      max: 200,
      step: 1,
      onchange: save('compression_count'),
    },
    'rescue breaths': {
      value: s.breath_count,
      min: 0,
      max: 100,
      step: 1,
      onchange: save('breath_count'),
    },
    'rpm': {
      value: s.compression_rpm,
      min: 1,
      max: 200,
      step: 10,
      onchange: save('compression_rpm'),
    },
    'breaths period': {
      value: s.breath_period_sec,
      min: 1,
      max: 60,
      step: 1,
      onchange: save('breath_period_sec'),
    }
  };
  E.showMenu(menu);
})
