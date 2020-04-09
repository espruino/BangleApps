(function(back) {
  const SETTINGS_FILE = 'widpedom.settings.json'

  // initialize with default settings...
  let s = {
    'goal': 10000,
    'progress': false,
  }
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {}
  for (const key in saved) {
    s[key] = saved[key]
  }

  function save() {
    storage.write(SETTINGS_FILE, s)
    WIDGETS['wpedom'].reload()
  }

  E.showMenu({
    '': { 'title': 'Pedometer widget' },
    'Daily Goal': {
      value: s.goal,
      min: 0, step: 1000,
      format: s => (s ? s / 1000 + ',000' : '0'),
      onchange: (g) => {
        s.goal = g
        s.progress = !!g
        save()
      },
    },
    'Show Progress': {
      value: s.progress,
      format: () => (s.progress ? 'Yes' : 'No'),
      onchange: () => {
        s.progress = !s.progress
        save()
      },
    },
    '< Back': back,
  })
})
