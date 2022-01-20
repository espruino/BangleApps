(function(back) {
  const SETTINGS_FILE = "run.json";

  // initialize with default settings...
  let s = {
    'use_gps': true,
    'use_hrm': true
  }

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {}
  const saved = settings || {}
  for (const key in saved) {
    s[key] = saved[key]
  }

  function save() {
    settings = s
    storage.write(SETTINGS_FILE, settings)
  }

  E.showMenu({
    '': { 'title': 'Run' },
    '< Back': back,
    'Use GPS': {
      value: s.use_gps,
      format: () => (s.use_gps ? 'Yes' : 'No'),
      onchange: () => {
        s.use_gps = !s.use_gps;
        save();
      },
    },
    'Use HRM': {
      value: s.use_hrm,
      format: () => (s.use_hrm ? 'Yes' : 'No'),
      onchange: () => {
        s.use_hrm = !s.use_hrm;
        save();
      },
    }
  })
})
