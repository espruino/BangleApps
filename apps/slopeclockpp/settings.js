(function(back) {
  const SETTINGS_FILE = "slopeclockpp.json";
  const storage = require('Storage');
  let settings = Object.assign(
    storage.readJSON("slopeclockpp.default.json", true) || {},
    storage.readJSON(SETTINGS_FILE, true) || {}
  );

  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }

  function showMainMenu() {
    let menu ={
      '': { 'title': 'Slope Clock ++' },
      /*LANG*/'< Back': back,
      /*LANG*/'Hide Widgets': {
        value: !!settings.hideWidgets,
        onchange: x => save('hideWidgets', x),
      },
      /*LANG*/'Red': {
        value: !!settings.colorRed,
        format: () => (settings.colorRed ? 'Yes' : 'No'),
        onchange: x => save('colorRed', x),
      },
      /*LANG*/'Green': {
        value: !!settings.colorGreen,
        format: () => (settings.colorGreen ? 'Yes' : 'No'),
        onchange: x => save('colorGreen', x),
      },
      /*LANG*/'Blue': {
        value: !!settings.colorBlue,
        format: () => (settings.colorBlue ? 'Yes' : 'No'),
        onchange: x => save('colorBlue', x),
      },
      /*LANG*/'Magenta': {
        value: !!settings.colorMagenta,
        format: () => (settings.colorMagenta ? 'Yes' : 'No'),
        onchange: x => save('colorMagenta', x),
      },
      /*LANG*/'Cyan': {
        value: !!settings.colorCyan,
        format: () => (settings.colorCyan ? 'Yes' : 'No'),
        onchange: x => save('colorCyan', x),
      },
      /*LANG*/'Yellow': {
        value: !!settings.colorYellow,
        format: () => (settings.colorYellow ? 'Yes' : 'No'),
        onchange: x => save('colorYellow', x),
      },
      /*LANG*/'Black': {
        value: !!settings.colorBlack,
        format: () => (settings.colorBlack ? 'Yes' : 'No'),
        onchange: x => save('colorBlack', x),
      },
      /*LANG*/'White': {
        value: !!settings.colorWhite,
        format: () => (settings.colorWhite ? 'Yes' : 'No'),
        onchange: x => save('colorWhite', x),
      }
    };
    E.showMenu(menu);
  }


  showMainMenu();
});
