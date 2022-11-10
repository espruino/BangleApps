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
      /*LANG*/'show steps': {
        value: !!settings.showSteps,
        format: () => (settings.showSteps ? 'Yes' : 'No'),
        onchange: x => save('showSteps', x),
      },
      /*LANG*/'show weather': {
        value: !!settings.showWeather,
        format: () => (settings.showWeather ? 'Yes' : 'No'),
        onchange: x => save('showWeather', x),
      },
      /*LANG*/'red': {
        value: !!settings.colorRed,
        format: () => (settings.colorRed ? 'Yes' : 'No'),
        onchange: x => save('colorRed', x),
      },
      /*LANG*/'green': {
        value: !!settings.colorGreen,
        format: () => (settings.colorGreen ? 'Yes' : 'No'),
        onchange: x => save('colorGreen', x),
      },
      /*LANG*/'blue': {
        value: !!settings.colorBlue,
        format: () => (settings.colorBlue ? 'Yes' : 'No'),
        onchange: x => save('colorBlue', x),
      },
      /*LANG*/'magenta': {
        value: !!settings.colorMagenta,
        format: () => (settings.colorMagenta ? 'Yes' : 'No'),
        onchange: x => save('colorMagenta', x),
      },
      /*LANG*/'cyan': {
        value: !!settings.colorCyan,
        format: () => (settings.colorCyan ? 'Yes' : 'No'),
        onchange: x => save('colorCyan', x),
      },
      /*LANG*/'yellow': {
        value: !!settings.colorYellow,
        format: () => (settings.colorYellow ? 'Yes' : 'No'),
        onchange: x => save('colorYellow', x),
      }
    };
    E.showMenu(menu);
  }


  showMainMenu();
});
