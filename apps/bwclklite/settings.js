(function(back) {
    const SETTINGS_FILE = "bwclklite.setting.json";

    // initialize with default settings...
    const storage = require('Storage')
    let settings = {
      screen: "Normal",
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

    var screenOptions = ["Normal", "Dynamic", "Full"];
    E.showMenu({
      '': { 'title': 'BW Clock' },
      '< Back': back,
      'Screen': {
        value: 0 | screenOptions.indexOf(settings.screen),
        min: 0, max: 2,
        format: v => screenOptions[v],
        onchange: v => {
          settings.screen = screenOptions[v];
          save();
        },
      },
      'Show Lock': {
        value: settings.showLock,
        onchange: () => {
          settings.showLock = !settings.showLock;
          save();
        },
      },
      'Hide Colon': {
        value: settings.hideColon,
        onchange: () => {
          settings.hideColon = !settings.hideColon;
          save();
        },
      }
    });
  })
