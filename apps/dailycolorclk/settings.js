(function(back) {
  const SETTINGS_FILE = "dailycolorclk.json";
  const storage = require('Storage');
  let settings = Object.assign(
    storage.readJSON("dailycolorclk.default.json", true) || {},
    storage.readJSON(SETTINGS_FILE, true) || {}
  );

  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }
  function showDitheringMenu(){
    var menu={
    "< Back": () => showMainMenu,
    /*LANG*/'Orange (Dithered)': {
      value: !!settings.colorOrange,
      onchange: x => save('colorOrange', x),
    },
      /*LANG*/'Purple (Dithered)': {
        value: !!settings.colorPurple,
        onchange: x => save('colorPurple', x),
      }
    }
    E.showMenu(menu);
  }
  function showMainMenu() {
    let menu ={
      '': { 'title': 'Daily Color Clock' },
      /*LANG*/'< Back': back,
      /*LANG*/'Hide Widgets': {
        value: !!settings.hideWidgets,
        onchange: x => save('hideWidgets', x),
      },
      /*LANG*/'Dithered Colors': () => {showDitheringMenu()},
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
      },
      
      
    };
    E.showMenu(menu);
  }

  
  showMainMenu();
})
