(function(back) {
  const PEDOMFILE = "wpedom.json";

  // initialize with default settings...
  let s = {
    'goal': 10000,
    'progress': false,
    'large': false,
    'hide': false
  }
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  const d = storage.readJSON(PEDOMFILE, 1) || {}
  const saved = d.settings || {}
  for (const key in saved) {
    s[key] = saved[key]
  }

  function save() {
    d.settings = s
    storage.write(PEDOMFILE, d)
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
        save();
      },
    },
    'Show Progress': {
      value: s.progress,
      onchange: () => {
        s.progress = !s.progress
        save();
      },
    },
    'Large Digits': {
      value: s.large,
      onchange: () => {
        s.large = !s.large
        save();
      },
    },
    'Hide Widget': {
      value: s.hide,
      onchange: () => {
        s.hide = !s.hide
        save();
      },
    },
    '< Back': back,
  })
})
