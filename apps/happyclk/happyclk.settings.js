(function(back) {
  const SETTINGS_FILE = "happyclk.setting.json";

  // initialize with default settings...
  const storage = require('Storage')
  let settings = {
    color: "Dark",
    screen: "Dynamic"
  };
  let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
  for (const key in saved_settings) {
    settings[key] = saved_settings[key]
  }

  function save() {
    storage.write(SETTINGS_FILE, settings)
  }

  var colorOptions = ["Dark", "Black", "White", "Blue", "Green", "Red", "Purple", "Yellow"];
  var screenOptions = ["Normal", "Dynamic", "Full"];
  E.showMenu({
    '': { 'title': 'Happy Clock' },
    '< Back': back,
    'Screen': {
      value: 0 | screenOptions.indexOf(settings.screen),
      min: 0, max: screenOptions.length-1,
      format: v => screenOptions[v],
      onchange: v => {
        settings.screen = screenOptions[v];
        save();
      },
    },
    'Theme': {
      value: 0 | colorOptions.indexOf(settings.color),
      min: 0, max: colorOptions.length-1,
      format: v => colorOptions[v],
      onchange: v => {
        settings.color = colorOptions[v];
        save();
      },
    },
  });
})
