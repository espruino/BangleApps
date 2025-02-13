(function(back) {
  const storage = require('Storage');
  let settings = storage.readJSON('weather.json', 1) || {};
  function save(key, value) {
    settings[key] = value;
    storage.write('weather.json', settings);
  }
  E.showMenu({
    '': { 'title': 'Weather' },
    'Expiry': {
      value: "expiry" in settings ? settings["expiry"] : 2*3600000,
      min: 0,
      max : 24*3600000,
      step: 15*60000,
      format: x => {
        if (x == 0) return "none";
        if (x < 3600000) return Math.floor(x/60000) + "m";
        if (x < 86400000) return Math.floor(x/36000)/100 + "h";
      },
      onchange: x => save('expiry', x),
    },
    'Hide Widget': {
      value: "hide" in settings ? settings.hide : false,
      onchange: () => {
        settings.hide = !settings.hide
        save('hide', settings.hide);
      },
    },
    '< Back': back,
  });
})
