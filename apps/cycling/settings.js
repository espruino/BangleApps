// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const storage = require('Storage')
  const SETTINGS_FILE = 'cycling.json'

  // Set default values and merge with stored values
  let settings = Object.assign({
    metric: true,
    sensors: {},
  }, (storage.readJSON(SETTINGS_FILE, true) || {}));

  const menu = {
    '': { 'title': 'Cycling' },
    '< Back': back,
    'Units': {
      value: settings.metric,
      format: v => v ? 'metric' : 'imperial',
      onchange: (metric) => {
        settings.metric = metric;
        storage.writeJSON(SETTINGS_FILE, settings);
      },
    },
  }

  const sensorMenus = {};
  for (var addr of Object.keys(settings.sensors)) {
    // Define sub menu
    sensorMenus[addr] = {
      '': { title: addr },
      '< Back': () => E.showMenu(menu),
      'cm': {
        value: settings.sensors[addr].cm,
        min: 80, max: 240, step: 1,
        onchange: (v) => {
          settings.sensors[addr].cm = v;
          storage.writeJSON(SETTINGS_FILE, settings);
        },
      },
      '+ mm': {
        value: settings.sensors[addr].mm,
        min: 0, max: 9, step: 1,
        onchange: (v) => {
          settings.sensors[addr].mm = v;
          storage.writeJSON(SETTINGS_FILE, settings);
        },
      },
    };

    // Add entry to main menu
    menu[addr] = () => E.showMenu(sensorMenus[addr]);
  }

  E.showMenu(menu);
})
