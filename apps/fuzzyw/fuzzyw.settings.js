(function(back) {
  const SETTINGS_FILE = "fuzzy.settings.json";

  // initialize with default settings...
  let s = {'showWidgets': false}

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = storage.readJSON(SETTINGS_FILE, 1) || s;
  const saved = settings || {}
  for (const key in saved) {
    s[key] = saved[key]
  }

  function save() {
    settings = s
    storage.write(SETTINGS_FILE, settings)
  }

  E.showMenu({
    '': { 'title': 'Fuzzy Word Clock' },
    '< Back': back,
    'Show Widgets': {
      value: settings.showWidgets,
      onchange: () => {
        settings.showWidgets = !settings.showWidgets;
        save();
      }
    },
  });
})
