(function(back) {
  const SETTINGS_FILE = "fuzzyw.json";
  
  var align_options = ['Left','Centre','Right'];
  var language_options = ['System', 'en_GB'];

  // initialize with default settings...
  let s = {'language': language_options[0], 'align': align_options[1]};

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
    '': { 'title': 'Fuzzy Clock' },
    '< Back': back,
    'Language': {
      value: 0 | language_options.indexOf(s.theme),
      min: 0, max: language_options.length - 1,
      format: v => language_options[v],
      onchange: v => {
        s.theme = language_options[v];
        save();
      }
    },
    'Language': {
      value: 0 | align_options.indexOf(s.theme),
      min: 0, max: align_options.length - 1,
      format: v => align_options[v],
      onchange: v => {
        s.theme = align_options[v];
        save();
      }
    },
  });
})
