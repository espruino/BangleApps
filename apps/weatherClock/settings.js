(function(back) {
  const SETTINGS_FILE = "weatherClock.json";

  // Load setings file
  const storage = require('Storage')
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {}
  let s;
  s.icon = (settings.icon === undefined ? true : settings.icon);
  s.day = (settings.day === undefined ? true : settings.day);
  s.date = (settings.date === undefined ? true : settings.date);
  s.wind = (settings.wind === undefined ? true : settings.wind);

  function save() {
    settings = s
    storage.write(SETTINGS_FILE, settings)
  }

  E.showMenu({
    '': { 'title': 'Weather Clock' },
    '< Back': back,
	'Weather Icon': {
      value: !!s.icon,
      onchange: v => {
        s.icon = v;
        save();
      },
    },
	'Day Of Week': {
      value: !!s.day,
      onchange: v => {
        s.day = v;
        save();
      },
    },
    'Date': {
      value: !!s.date,
      onchange: v => {
        s.date = v;
        save();
      },
    },
    'Wind Speed': {
      value: !!s.wind,
      onchange: v => {
        s.wind = v;
        save();
      },
    }
  })
})
