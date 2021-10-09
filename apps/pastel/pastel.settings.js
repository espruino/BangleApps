(function(back) {
  const SETTINGS_FILE = "pastel.json";

  // initialize with default settings...
  let s = {
    'grid': false,
    'date': false,
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

  var font_options = ["Lato","Architect","GochiHand","CabinSketch","Orbitron"];
  
  E.showMenu({
    '': { 'title': 'Pastel Clock' },
    'Font': {
      value: 0 | font_options.indexOf(s.font),
      min: 0, max: 4,
      format: v => font_options[v],
      onchange: v => {
        s.font = font_options[v];
        save();
      },
    },
    'Show Grid': {
      value: s.grid,
      format: () => (s.grid ? 'Yes' : 'No'),
      onchange: () => {
        s.grid = !s.grid
        save()
      },
    },
    'Show Date': {
      value: s.date,
      format: () => (s.date ? 'Yes' : 'No'),
      onchange: () => {
        s.date = !s.date
        save()
      },
    },
    '< Back': back,
  })
})
