(function(back) {
  const SETTINGS_FILE = "lcars.setting.json";

  // initialize with default settings...
  const storage = require('Storage')
  let settings = {
    alarm: -1,
    dataRow1: "Battery",
    dataRow2: "Steps",
    dataRow3: "Temp."
  };
  let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
  for (const key in saved_settings) {
    settings[key] = saved_settings[key]
  }

  function save() {
    storage.write(SETTINGS_FILE, settings)
  }

  var data_options = ['Battery', 'Steps', 'Temp.', "HRM"];

  E.showMenu({
    '': { 'title': 'LCARS Clock' },
    '< Back': back,
    'Row 1': {
      value: 0 | data_options.indexOf(settings.dataRow1),
      min: 0, max: 3,
      format: v => data_options[v],
      onchange: v => {
        settings.dataRow1 = data_options[v];
        save();
      },
    },
    'Row 2': {
      value: 0 | data_options.indexOf(settings.dataRow2),
      min: 0, max: 3,
      format: v => data_options[v],
      onchange: v => {
        settings.dataRow2 = data_options[v];
        save();
      },
    },
    'Row 3': {
      value: 0 | data_options.indexOf(settings.dataRow3),
      min: 0, max: 3,
      format: v => data_options[v],
      onchange: v => {
        settings.dataRow3 = data_options[v];
        save();
      },
    }
  });
})
