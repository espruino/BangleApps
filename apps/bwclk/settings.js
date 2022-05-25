(function(back) {
    const SETTINGS_FILE = "bwclk.setting.json";

    // initialize with default settings...
    const storage = require('Storage')
    let settings = {
      fullscreen: false,
      showLock: true,
      hideColon: false,
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
      settings[key] = saved_settings[key]
    }

    function save() {
      storage.write(SETTINGS_FILE, settings)
    }


    E.showMenu({
      '': { 'title': 'BW Clock' },
      '< Back': back,
      'Fullscreen': {
        value: settings.fullscreen,
        format: () => (settings.fullscreen ? 'Yes' : 'No'),
        onchange: () => {
          settings.fullscreen = !settings.fullscreen;
          save();
        },
      },
      'Show Lock': {
        value: settings.showLock,
        format: () => (settings.showLock ? 'Yes' : 'No'),
        onchange: () => {
          settings.showLock = !settings.showLock;
          save();
        },
      },
      'Hide Colon': {
        value: settings.hideColon,
        format: () => (settings.hideColon ? 'Yes' : 'No'),
        onchange: () => {
          settings.hideColon = !settings.hideColon;
          save();
        },
      }
    });
  })
