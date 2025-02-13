(function(back) {
  const SETTINGS_FILE = "pebble.json";

  // TODO Only the color/theme indices should be written in the settings file so the labels can be translated

  // Initialize with default settings...
  let s = {'bg': '#0f0', 'color': 'Green', 'theme':'System', 'showlock':false}

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || s;
  const saved = settings || {};
  for (const key in saved) {
    s[key] = saved[key]
  }

  function save() {
    settings = s;
    storage.write(SETTINGS_FILE, settings);
  }

  var color_options = ['Green','Orange','Cyan','Purple','Red','Blue'];
  var bg_code = ['#0f0','#ff0','#0ff','#f0f','#f00','#00f'];
  var theme_options = ['System', 'Light', 'Dark'];

  E.showMenu({
    '': { 'title': 'Pebble Clock' },
    /*LANG*/'< Back': back,
    /*LANG*/'Colour': {
      value: 0 | color_options.indexOf(s.color),
      min: 0, max: 5,
      format: v => color_options[v],
      onchange: v => {
        s.color = color_options[v];
        s.bg = bg_code[v];
        save();
      }
    },
    /*LANG*/'Theme': {
      value: 0 | theme_options.indexOf(s.theme),
      min: 0, max: theme_options.length - 1,
      format: v => theme_options[v],
      onchange: v => {
        s.theme = theme_options[v];
        save();
      }
    },
    /*LANG*/'Show Lock': {
      value: settings.showlock,
      onchange: () => {
        settings.showlock = !settings.showlock;
        save();
      }
    },
  });
})
