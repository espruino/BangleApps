(function(back) {
  const SETTINGS_FILE = "primetimelato.json";

  // initialize with default settings...
  let s = {
    'buzz_on_prime': true,
    'debug': false
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
      settings = s;
      storage.write(SETTINGS_FILE, settings);
  }

  E.showMenu({
    '': { 'title': 'Prime Time Lato' },
    '< Back': back,
    'Buzz on Prime': {
      value: !!s.buzz_on_prime,
      onchange: v => {
        s.buzz_on_prime = v;
        save();
      },
    },

    'Debug': {
      value: !!s.debug,
      onchange: v => {
        s.debug = v;
        save();
      },
    }

    
  })
})
