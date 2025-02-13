(function(back) {
  const SETTINGS_FILE = "banglexercise.json";
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }
  E.showMenu({
    '': { 'title': 'BanglExercise' },
    '< Back': back,
    'Buzz': {
      value: "buzz" in settings ? settings.buzz : false,
      onchange: () => {
        settings.buzz = !settings.buzz;
        save('buzz', settings.buzz);
      }
    }
  });
})
