// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'openseacsettings.json'
  // initialize with default settings...
  let s = {
    'drawcourse': true,
    'autocenter': false,
  }
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {}
  for (const key in saved) {
    s[key] = saved[key];
  }
  // creates a function to safe a specific setting, e.g.  save('color')(1)
  function save(key) {
    return function (value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
    }
  }
  const menu = {
    '': { 'title': 'OpenSeaChart' },
    '< Back': back,
    'Draw course': {
      value: s.drawcourse,
      format: boolFormat,
      onchange: save('drawcourse'),
    },
    'Auto center': {
      value: s.autocenter,
      format: boolFormat,
      onchange: save('autoconnect'),
    }
  }
  E.showMenu(menu);
})
