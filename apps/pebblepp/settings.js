(function(back) {
  const SETTINGS_FILE = "pebblepp.json";

  // Initialize with default settings...
  let s = {'theme':'System', 'showlock':false}

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || s;
  const saved = settings || {};
  for (const key in saved) {
    s[key] = saved[key]
  }

  function save() {
    settings = s;
    storage.write(SETTINGS_FILE, settings);
  }

  var theme_options = ['System', 'Light', 'Dark'];

  E.showMenu({
    '': { 'title': 'Pebble++ Clock' },
    /*LANG*/'< Back': back,
    /*LANG*/'Theme': {
      value: 0 | theme_options.indexOf(s.theme),
      min: 0, max: theme_options.length - 1,
      format: v => theme_options[v],
      onchange: v => {
        s.theme = theme_options[v];
        save();
      }
    }
  });
});
