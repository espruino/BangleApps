(function(back) {
  const SETTINGS_FILE = "pastel.json";

  // initialize with default settings...
  let s = {
    'grid': false,
    'weather': false,
    'idle_check': true,
    'font': "Lato"
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

  var font_options = ["Lato","Architect","GochiHand","CabinSketch","Orbitron","Monoton","Elite"];
  
  E.showMenu({
    '': { 'title': 'Pastel Clock' },
    '< Back': back,
    'Font': {
      value: 0 | font_options.indexOf(s.font),
      min: 0, max: 6,
      format: v => font_options[v],
      onchange: v => {
        s.font = font_options[v];
        save();
      },
    },
    'Show Grid': {
      value: !!s.grid,
      onchange: v => {
        s.grid = v;
        save();
      },
    },
    'Show Weather': {
      value: !!s.weather,
      onchange: v => {
        s.weather = v;
        save();
      },
    },
    'Idle Warning': {
      value: !!s.idle_check,
      onchange: v => {
        s.idle_check = v;
        save();
      },
    }
  })
})
