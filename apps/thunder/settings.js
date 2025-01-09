(function (back) {
  const FILE = "thunder.json";
  const DEFAULTS = {
    units: 0,
  };

  let settings = {};

  const loadSettings = function() {
    settings = require('Storage').readJSON(FILE, 1) || DEFAULTS;
  };

  const saveSettings = function() {
    require('Storage').writeJSON(FILE, settings);
  };

  const showMenu = function() {
    const unitOptions = [/*LANG*/'Auto','kms','miles'];

    const menu = {
      '': {'title': 'Thunder'},
      '< Back': back,
      'Units': {
        value: 0|settings.units,
        min: 0,
        max: unitOptions.length-1,
        format: v => unitOptions[v],
        onchange: v => {
          settings.units = 0 | v;
          saveSettings(settings);
        }
      },
    };

    E.showMenu(menu);
  };

  loadSettings();
  showMenu();
})
