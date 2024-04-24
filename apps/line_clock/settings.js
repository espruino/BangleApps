(function(back) {
    const SETTINGS_FILE = "line_clock.setting.json";

    // initialize with default settings...
    const storage = require('Storage')
    let settings = {
      screen: "Full",
      showLock: true,
      showMinute: true,
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
      settings[key] = saved_settings[key]
    }

    function save() {
      storage.write(SETTINGS_FILE, settings)
    }

  const screenOptions = ["Normal", "Full"];

    E.showMenu({
      '': { 'title': 'Line Clock' },
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
      'Show Minute': {
        value: settings.showMinute,
        onchange: () => {
          settings.showMinute = !settings.showMinute;
          save();
        },
      }
    });
  })
