(function(back) {
  const SETTINGS_FILE = "torch.json";

  // initialize with default settings...
  let s = {'bg': '#FFFFFF', 'color': 'White'}

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

  var color_options = ['Green','Orange','Cyan','Purple','Red','Blue','Yellow','White'];
  var bg_code = ['#0f0','#FFA500','#0ff','#f0f','#f00','#00f','#ffef00','#FFFFFF'];
  
  E.showMenu({
    '': { 'title': 'Torch' },
    '< Back': back,
    'Colour': {
      value: 0 | color_options.indexOf(s.color),
      min: 0, max: 7,
      format: v => color_options[v],
      onchange: v => {
        s.color = color_options[v];
        s.bg = bg_code[v];
        save();
      },
    }
  });
})
