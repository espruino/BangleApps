// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'openwindsettings.json'
  // initialize with default settings...
  let settings = {
    'truewind': false,
    'mount_angle': 0
  }
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {}
  for (const key in saved) {
    settings[key] = saved[key];
  }
  // creates a function to safe a specific setting, e.g.  save('color')(1)
  function save(key) {
    return function (value) {
      settings[key] = value;
      storage.write(SETTINGS_FILE, settings);
    }
  }
  const menu = {
    '': { 'title': 'OpenWind' },
    '< Back': back,
    'True wind': {
      value: settings.truewind,
      onchange: save('truewind'),
    },
    'Mounting angle': {
      value: settings.mount_angle,
      min: 0,
      max: 355,
      step: 5,
      onchange: save('mount_angle'),
    }
  }
  E.showMenu(menu);
})
