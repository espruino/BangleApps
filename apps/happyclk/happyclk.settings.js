(function(back) {
  const SETTINGS_FILE = "happyclk.setting.json";

  // initialize with default settings...
  const storage = require('Storage')
  let settings = {
    color: "Dark"
  };
  let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
  for (const key in saved_settings) {
    settings[key] = saved_settings[key]
  }

  function save() {
    storage.write(SETTINGS_FILE, settings)
  }

  var colorOptions = ["Dark", "Black", "White", "Blue", "Green", "Red", "Purple", "Yellow"];
  E.showMenu({
    '': { 'title': 'Happy Clock' },
    '< Back': back,
    'Theme': {
      value: 0 | colorOptions.indexOf(settings.color),
      min: 0, max: colorOptions.length,
      format: v => colorOptions[v],
      onchange: v => {
        settings.color = colorOptions[v];
        save();
      },
    }
  });
})
