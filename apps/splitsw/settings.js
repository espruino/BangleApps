(function (back) {
  const FILE = "splitsw.json";
  const DEFAULTS = {
    button: 0,
    buttonWhileLocked: false,
    disableBacklightTimeout: true,
    disableLockTimeout: true,
  };

  let settings = {};

  const loadSettings = function() {
    settings = require('Storage').readJSON(FILE, 1) || DEFAULTS;
  };

  const saveSettings = function() {
    require('Storage').writeJSON(FILE, settings);
  };

  const showMenu = function() {
    const buttonOptions = [/*LANG*/'Exit','Start/Stop','Start/Split'];

    const menu = {
      '': {'title': 'Stopwatch'},
      '< Back': back,
      'Button': {
        value: 0|settings.button,
        min: 0,
        max: buttonOptions.length-1,
        format: v => buttonOptions[v],
        onchange: v => {
          settings.button = 0 | v;
          saveSettings(settings);
        }
      },
      'Use button while locked': {
        value: !!settings.buttonWhileLocked,
        onchange: v => {
          settings.buttonWhileLocked = v;
          saveSettings();
        }
      },
      'Disable backlight timeout': {
        value: !!settings.disableBacklightTimeout,
        onchange: v => {
          settings.disableBacklightTimeout = v;
          saveSettings();
        }
      },
      'Disable lock timeout': {
        value: !!settings.disableLockTimeout,
        onchange: v => {
          settings.disableLockTimeout = v;
          saveSettings();
        }
      },
    };

    E.showMenu(menu);
  };

  loadSettings();
  showMenu();
});
