(function(back) {
  const SETTINGS_FILE = "weatherClock.json";

  // Load settings file
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  let s = {};
  s.date = (settings.date === undefined ? true : settings.date);
  s.day = (settings.day === undefined ? true : settings.day);
  s.icon = (settings.icon === undefined ? true : settings.icon);
  s.wind = (settings.wind === undefined ? true : settings.wind);
  s.src = (settings.src === undefined ? false : settings.src);

  function save() {
    settings = s
    storage.write(SETTINGS_FILE, settings)
  }

  E.showMenu({
    '': { 'title': 'Weather Clock' },
    '< Back': back,
	'Show date': {
      value: !!s.date,
      onchange: v => {
        s.date = v;
        save();
      },
    },
	'Show day Of Week': {
      value: !!s.day,
      onchange: v => {
        s.day = v;
        save();
      },
    },
    'Show weather Icon': {
      value: !!s.icon,
      onchange: v => {
        s.icon = v;
        save();
      },
    },
    'Show wind Speed': {
      value: !!s.wind,
      onchange: v => {
        s.wind = v;
        save();
      },
    },
    'Use weather app icons': {
      value: !!s.src,
      onchange: v => {
        s.src = v;
        save();
      },
    }
  });
})
