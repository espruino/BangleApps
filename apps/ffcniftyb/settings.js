(function(back) {
  const storage = require('Storage');
  const SETTINGS_FILE = "ffcniftyb.json";

  function load(settings) {
    const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
    for (const key in saved) {
      settings[key] = saved[key];
    }
    return settings;
  }

  function save(settings) {
    storage.write(SETTINGS_FILE, settings)
  }

  const settings = load({
    color: 65535,
  });

  function showColors() {
    const saveColor = (color) => () => {
      settings.color = color;
      save(settings);
      showSettings();
    }

    E.showMenu({
      '': { 'title': 'Colors' },
      '< Back':  showSettings,
      'White':   saveColor(65535),
      'Red':     saveColor(63488),
      'Yellow':  saveColor(65504),
      'Cyan':    saveColor(2047),
      'Green':   saveColor(2016),
      'Blue':    saveColor(31),
      'Black':   saveColor(0),
    })
  }

  function showSettings() {
    E.showMenu({
      '': { 'title': 'Nifty B Clock' },
      '< Back':  back,
      'Color':   showColors,
    })
  }

  showColors();
})
