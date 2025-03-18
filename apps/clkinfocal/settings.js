(function(back) {
  const SETTINGS_FILE = "clkinfocal.json";

  // initialize with default settings...
  let s = {'fmt': 0};

  // and overwrite them with any saved values
  // this way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  const saved = settings || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  function save() {
    settings = s;
    storage.write(SETTINGS_FILE, settings);
  }

  var date_options = ["DDD","DDD dd","dd MMM"];
  
  E.showMenu({
    '': { 'title': 'Cal Clkinfo' },
    '< Back': back,
    'Format': {
      value: 0 | date_options.indexOf(s.fmt),
      min: 0, max: 2,
      format: v => date_options[v],
      onchange: v => {
        s.fmt = date_options[v];
        save();
      },
    }
  });

})
