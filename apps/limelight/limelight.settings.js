(function(back) {
  const SETTINGS_FILE = "limelight.json";

  // initialize with default settings...
  let s = {
    'vector_size': 42,
    'vector': false,
    'font': "Limelight",
    'secondhand': false,
    'fullscreen': false
  }

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {}
  const saved = settings || {}

  // copy settings into variable
  for (const key in saved) {
    s[key] = saved[key]
  }

  function save() {
    settings = s
    storage.write(SETTINGS_FILE, settings)
  }

  var font_options = ["Limelight","GochiHand","Grenadier","Monoton"];

  E.showMenu({
    '': { 'title': 'Limelight Clock' },
    '< Back': back,
    'Full Screen': {
      value: s.fullscreen,
      onchange: () => {
        s.fullscreen = !s.fullscreen;
        save();
      },
    },
    'Font': {
      value: 0 | font_options.indexOf(s.font),
      min: 0, max: 3,
      format: v => font_options[v],
      onchange: v => {
        s.font = font_options[v];
        save();
      },
    },
    'Vector Font': {
      value: s.vector,
      onchange: () => {
        s.vector = !s.vector;
        save();
      },
    },
    'Vector Size': {
      value: s.vector_size,
      min: 24,
      max: 56,
      step: 6,
      onchange: v => {
        s.vector_size = v;
        save();
      }
    },
    'Second Hand': {
      value: s.secondhand,
      onchange: () => {
        s.secondhand = !s.secondhand;
        save();
      },
    }
  });
})
