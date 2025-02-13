// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'cscsensor.json'
  // initialize with default settings...
  let s = {
    'wheelcirc': 2230,
  }
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {}
  for (const key in saved) {
    s[key] = saved[key];
  }
  // creates a function to safe a specific setting, e.g.  save('color')(1)
  function save(key) {
    return function (value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
    }
  }
  const menu = {
    '': { 'title': /*LANG*/'Cycle speed sensor' },
    '< Back': back,
    /*LANG*/'Wheel circ.(mm)': {
      value: s.wheelcirc,
      min: 800,
      max: 2400,
      step: 5,
      onchange: save('wheelcirc'),
    },
    /*LANG*/'Reset total distance': function() {
      E.showPrompt(/*LANG*/"Zero total distance?", {buttons: {/*LANG*/"No":false, /*LANG*/"Yes":true}}).then(function(v) {
        if (v) {
          s['totaldist'] = 0;
          storage.write(SETTINGS_FILE, s);
        }
      }).then(back);
    }
  }
  E.showMenu(menu);
})
