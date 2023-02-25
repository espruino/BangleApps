(function(back) {
  const SETTINGS_FILE = "weatherClock.json";

  // initialize with default settings...
  let s = {
    'day': true,
    'date': true,
    'wind': true
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
    '': { 'title': 'Show Day of Week': {
      value: !!s.day,
      onchange: v => {
        s.day = v;
        save();
      },
    },
    'Show Date': {
      value: !!s.date,
      onchange: v => {
        s.date = v;
        save();
      },
    },
    'Show Wind Speed': {
      value: !!s.wind,
      onchange: v => {
        s.wind = v;
        save();
      },
    }
  })
})
