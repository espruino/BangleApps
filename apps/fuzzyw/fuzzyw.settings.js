(function(back) {
  const SETTINGS_FILE = "fuzzyw.settings.json";

  // initialize with default settings...
  let s = {'showWidgets': false, 'animate': true};

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || s;
  const saved = settings || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  function save() {
    settings = s;
    storage.write(SETTINGS_FILE, settings);
  }

  E.showMenu({
    '': { 'title': 'Fuzzy Word Clock' },
    '< Back': back,
    'Show Widgets': {
      value: s.showWidgets,
      onchange: () => {
        s.showWidgets = !s.showWidgets;
        save();
      }
    },
    'Animate': {
      value: s.animate,
      onchange: () => {
        s.animate = !s.animate;
        save();
      }
    }
  });
})
