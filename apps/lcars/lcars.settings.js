(function(back) {
  const SETTINGS_FILE = "lcars.setting.json";

  // initialize with default settings...
  const storage = require('Storage')
  let settings = {
    alarm: -1,
    dataRow1: "Battery",
    dataRow2: "Steps",
    dataRow3: "Temp",
    speed: "kph",
    fullscreen: false,
  };
  let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
  for (const key in saved_settings) {
    settings[key] = saved_settings[key]
  }

  function save() {
    storage.write(SETTINGS_FILE, settings)
  }

  var dataOptions = ["Steps", "Battery", "VREF", "HRM", "Temp", "Humidity", "Wind", "Altitude", "CoreT"];
  var speedOptions = ["kph", "mph"];

  E.showMenu({
    '': { 'title': 'LCARS Clock' },
    '< Back': back,
    'Row 1': {
      value: 0 | dataOptions.indexOf(settings.dataRow1),
      min: 0, max: 8,
      format: v => dataOptions[v],
      onchange: v => {
        settings.dataRow1 = dataOptions[v];
        save();
      },
    },
    'Row 2': {
      value: 0 | dataOptions.indexOf(settings.dataRow2),
      min: 0, max: 8,
      format: v => dataOptions[v],
      onchange: v => {
        settings.dataRow2 = dataOptions[v];
        save();
      },
    },
    'Row 3': {
      value: 0 | dataOptions.indexOf(settings.dataRow3),
      min: 0, max: 8,
      format: v => dataOptions[v],
      onchange: v => {
        settings.dataRow3 = dataOptions[v];
        save();
      },
    },
    'Full Screen': {
      value: settings.fullscreen,
      format: () => (settings.fullscreen ? 'Yes' : 'No'),
      onchange: () => {
        settings.fullscreen = !settings.fullscreen;
        save();
      },
    },
    'Speed': {
      value: 0 | speedOptions.indexOf(settings.speed),
      min: 0, max: 1,
      format: v => speedOptions[v],
      onchange: v => {
        settings.speed = speedOptions[v];
        save();
      },
    }
  });
})
