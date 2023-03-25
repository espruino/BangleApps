(function(back) {
  const SETTINGS_FILE = "widbaroalarm.json";
  const storage = require('Storage');
  let settings = Object.assign(
    storage.readJSON("widbaroalarm.default.json", true) || {},
    storage.readJSON(SETTINGS_FILE, true) || {}
  );

  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }

  function showMainMenu() {
    let menu ={
      '': { 'title': 'Barometer alarm widget' },
      /*LANG*/'< Back': back,
      "Interval": {
        value: settings.interval,
        min: 0,
        max: 120,
        step: 1,
        format: x => {
          return x != 0 ? x + ' min' : 'off';
        },
        onchange: x => save("interval", x)
      },
      "Low alarm": {
        value: settings.lowalarm,
        format: x => {
          return x ? 'Yes' : 'No';
        },
        onchange: x => save("lowalarm", x),
      },
      "Low threshold": {
        value: settings.min,
        min: 600,
        max: 1000,
        step: 5,
        onchange: x => save("min", x),
      },
      "High alarm": {
        value: settings.highalarm,
        format: x => {
          return x ? 'Yes' : 'No';
        },
        onchange: x => save("highalarm", x),
      },
      "High threshold": {
        value: settings.max,
        min: 700,
        max: 1100,
        step: 5,
        onchange: x => save("max", x),
      },
      "Drop alarm": {
        value: settings.drop3halarm,
        min: 0,
        max: 10,
        step: 1,
        format: x => {
          return x != 0 ? x + ' hPa/3h' : 'off';
        },
        onchange: x => save("drop3halarm", x)
      },
      "Raise alarm": {
        value: settings.raise3halarm,
        min: 0,
        max: 10,
        step: 1,
        format: x => {
          return x != 0 ? x + ' hPa/3h' : 'off';
        },
        onchange: x => save("raise3halarm", x)
      },
      "Show widget": {
        value: settings.show,
        format: x => {
          return x ? 'Yes' : 'No';
        },
        onchange: x => save('show', x)
      },
      "Buzz on alarm": {
        value: settings.buzz,
        format: x => {
          return x ? 'Yes' : 'No';
        },
        onchange: x => save('buzz', x)
      },
      'Dismiss delay': {
      value: settings.dismissDelayMin,
      min: 5, max: 60,
      onchange: v => {
        save('dismissDelayMin', v)
      },
      format: x => {
        return x + " min";
      }
    },
    'Pause delay': {
      value: settings.pauseDelayMin,
      min: 30, max: 240,
      onchange: v => {
        save('pauseDelayMin', v)
      },
      format: x => {
        return x + " min";
      }
    },
    };
    E.showMenu(menu);
  }

  showMainMenu();
});
