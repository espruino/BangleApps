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
        onchange: x => save('colorRed', x),
      },
      /*LANG*/'Green': {
        value: !!settings.colorGreen,
        onchange: x => save('colorGreen', x),
      },
      /*LANG*/'Blue': {
        value: !!settings.colorBlue,
        onchange: x => save('colorBlue', x),
      },
      /*LANG*/'Magenta': {
        value: !!settings.colorMagenta,
        onchange: x => save('colorMagenta', x),
      },
      /*LANG*/'Cyan': {
        value: !!settings.colorCyan,
        onchange: x => save('colorCyan', x),
      },
      /*LANG*/'Yellow': {
        value: !!settings.colorYellow,
        onchange: x => save('colorYellow', x),
      },
      /*LANG*/'Black': {
        value: !!settings.colorBlack,
        onchange: x => save('colorBlack', x),
      },
      /*LANG*/'White': {
        value: !!settings.colorWhite,
        onchange: x => save('colorWhite', x),
      }
    };
    E.showMenu(menu);
  }


  showMainMenu();
})
