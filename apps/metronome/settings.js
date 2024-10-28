// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'metronome.settings.json';

  // initialize with default settings...
  let s = {
    'beatsperbar': 4,
    'buzzintens': 0.75,
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
    return function(value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
    };
  }

  const menu = {
    '': { 'title': 'Metronome' },
    '< Back': back,
    'beats per bar': {
      value: s.beatsperbar,
      min: 1,
      max: 8,
      step: 1,
      onchange: save('beatsperbar'),
    },
    'buzz intensity': {
      value: s.buzzintens,
      min: 0.0,
      max: 1.0,
      step: 0.25,
      onchange: save('buzzintens'),
    },
  };
  E.showMenu(menu);
})
