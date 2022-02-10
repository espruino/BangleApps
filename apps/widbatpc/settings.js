// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'widbatpc.json'
  const COLORS = ['By Level', 'Green', 'Monochrome']

  // initialize with default settings...
  let s = {
    'color': COLORS[0],
    'percentage': true,
    'fillbar': false,
    'charger': true,
    'hideifmorethan': 100,
    'alwaysoncharge': false,
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
      WIDGETS["batpc"].reload();
    }
  }

  const onOffFormat = b => (b ? 'on' : 'off')
  const menu = {
    '': { 'title': 'Battery Widget' },
    '< Back': back,
    'Percentage': {
      value: s.percentage,
      format: onOffFormat,
      onchange: save('percentage'),
    },
    'Charging Icon': {
      value: s.charger,
      format: onOffFormat,
      onchange: save('charger'),
    },
    'Color': {
      format: () => s.color,
      onchange: function () {
        // cycles through options
        const oldIndex = COLORS.indexOf(s.color)
        const newIndex = (oldIndex + 1) % COLORS.length
        s.color = COLORS[newIndex]
        save('color')(s.color)
      }
    },
    'Fill Bar': {
      value: s.fillbar,
      format: onOffFormat,
      onchange: save('fillbar'),
    },
    'Hide if >': {
      value: s.hideifmorethan||100,
      min: 10,
      max : 100,
      step: 10,
      format: x => x+"%",
      onchange: save('hideifmorethan'),
    },
    'Show on charge': { // Not sure if this is readable enough in the 'big' menu
      value: s.alwaysoncharge,
      format: onOffFormat,
      onchange: save('alwaysoncharge'),
    },
  }
  E.showMenu(menu)
})
