(function(back) {
    const SETTINGS_FILE = "90sclk.setting.json";

    // initialize with default settings...
    const storage = require('Storage')
    let settings = {
      fullscreen: false,
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
      settings[key] = saved_settings[key]
    }

    function save() {
      storage.write(SETTINGS_FILE, settings)
    }


    E.showMenu({
      '': { 'title': '90s Clock' },
      '< Back': back,
      'Full Screen': {
        value: settings.fullscreen,
        onchange: () => {
          settings.fullscreen = !settings.fullscreen;
          save();
        },
      }
    });
  })
