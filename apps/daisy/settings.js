(function(back) {
  const SETTINGS_FILE = "daisy.json";

  // initialize with default settings...
  let s = {'gy' : '#020',
           'fg' : '#0f0',
           'color': 'Green',
           'check_idle' : true,
           'batt_hours' : false};

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

  var color_options = ['Green','Orange','Cyan','Purple','Red','Blue'];
  var fg_code = ['#0f0','#ff0','#0ff','#f0f','#f00','#00f'];
  var gy_code = ['#020','#220','#022','#202','#200','#002'];
  
  E.showMenu({
    '': { 'title': 'Daisy Clock' },
    '< Back': back,
    'Colour': {
      value: 0 | color_options.indexOf(s.color),
      min: 0, max: 5,
      format: v => color_options[v],
      onchange: v => {
        s.color = color_options[v];
        s.fg = fg_code[v];
        s.gy = gy_code[v];
        save();
      },
    },
    'Idle Warning': {
      value: !!s.idle_check,
      onchange: v => {
        s.idle_check = v;
        save();
      },
    },
    'Expected Battery Life In Days Not Percentage': {
      value: !!s.batt_hours,
      onchange: v => {
        s.batt_hours = v;
        save();
      },
    }
  });
})

