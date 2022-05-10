(function(back) {
  const SETTINGS_FILE = "rebble.json";

  // initialize with default settings...
  let localSettings = {'bg': '#0f0', 'color': 'Green', 'autoCycle': true}

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = storage.readJSON(SETTINGS_FILE, 1) || localSettings;
  const saved = settings || {}
  for (const key in saved) {
    localSettings[key] = saved[key]
  }

  function save() {
    settings = localSettings
    storage.write(SETTINGS_FILE, settings)
  }

  var color_options = ['Green','Orange','Cyan','Purple','Red','Blue'];
  var bg_code = ['#0f0','#ff0','#0ff','#f0f','#f00','#00f'];
  
  E.showMenu({
    '': { 'title': 'Rebble Clock' },
    '< Back': back,
    'Colour': {
      value: 0 | color_options.indexOf(localSettings.color),
      min: 0, max: 5,
      format: v => color_options[v],
      onchange: v => {
        localSettings.color = color_options[v];
        localSettings.bg = bg_code[v];
        save();
      },
    },
    'Auto Cycle': {
      value: "autoCycle" in localSettings ? localSettings.autoCycle : true,
      format: () => (localSettings.autoCycle ? 'Yes' : 'No'),
      onchange: () => {
        localSettings.autoCycle = !localSettings.autoCycle;
        save();
      }
    }
  });
})
