(function menu(back) {
  const SETTINGS_FILE = "wohrm.setting.json";

  // initialize with default settings...
  const storage = require('Storage');
  var settings = storage.readJSON(SETTINGS_FILE, 1) || {
    upperLimit: 130,
    lowerLimit: 100
  };

  function save() {
    storage.write(SETTINGS_FILE, settings);
  }

  E.showMenu({
    '': { 'title': 'Workout HRM' },
    '< Back': back,
    'Upper limit': {
      value: settings.upperLimit,
      min: 100, max: 200,
      onchange: v => {
        settings.upperLimit = v;
        save();
      }
    },
    'Lower limit': {
      value: settings.lowerLimit,
      min: 50, max: 150,
      onchange: v => {
        settings.lowerLimit = v;
        save();
      }
    }
  });
})
