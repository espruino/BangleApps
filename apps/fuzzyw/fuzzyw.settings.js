(function(back) {
  const SETTINGS_FILE = "fuzzyw.settings.json";
  
  var align_options = ['Left','Centre','Right'];
  var language_options = ['System', 'en_GB', 'en_US', 'es_ES', 'fr_FR', 'no_NO', 'sv_SE', 'de_DE'];

  // initialize with default settings...
  let s = {'language': 'System', 'alignment': 'Centre'};

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
    '': { 'title': 'Fuzzy Text Clock' },
    '< Back': back,
    'Language': {
      value: 0 | language_options.indexOf(s.language),
      min: 0, max: language_options.length - 1,
      format: v => language_options[v],
      onchange: v => {
        s.language = language_options[v];
        save();
      }
    },
    'Alignment': {
      value: 0 | align_options.indexOf(s.alignment),
      min: 0, max: align_options.length - 1,
      format: v => align_options[v],
      onchange: v => {
        s.alignment = align_options[v];
        save();
      }
    },
  });
})
