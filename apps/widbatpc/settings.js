// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'widbatpc.json'
  const COLORS = ['By Level', 'Green', 'Monochrome']
  const RM_JITTER_OPTIONS = [/*LANG*/'Off', /*LANG*/'Drop only'];

  // initialize with default settings...
  let s = {
    'color': COLORS[0],
    'percentage': true,
    'fillbar': false,
    'charger': true,
    'hideifmorethan': 100,
    'alwaysoncharge': false,
    'removejitter': 0,
    'buzzoncharge': true,
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
      if ("WIDGETS" in global && WIDGETS["batpc"] !== undefined) {
        WIDGETS["batpc"].reload();
      }
    }
  }

  const onOffFormat = b => (b ? 'on' : 'off')
  const menu = {
    '': { 'title': 'Battery Widget' },
    '< Back': back,
    /*LANG*/'Percentage': {
      value: s.percentage,
      format: onOffFormat,
      onchange: save('percentage'),
    },
    /*LANG*/'Charging Icon': {
      value: s.charger,
      format: onOffFormat,
      onchange: save('charger'),
    },
    /*LANG*/'Color': {
      format: () => s.color,
      onchange: function () {
        // cycles through options
        const oldIndex = COLORS.indexOf(s.color)
        const newIndex = (oldIndex + 1) % COLORS.length
        s.color = COLORS[newIndex]
        save('color')(s.color)
      }
    },
    /*LANG*/'Fill Bar': {
      value: s.fillbar,
      format: onOffFormat,
      onchange: save('fillbar'),
    },
    /*LANG*/'Hide if >': {
      value: s.hideifmorethan||100,
      min: 10,
      max : 100,
      step: 10,
      format: x => x+"%",
      onchange: save('hideifmorethan'),
    },
    /*LANG*/'Show on charge': { // Not sure if this is readable enough in the 'big' menu
      value: s.alwaysoncharge,
      format: onOffFormat,
      onchange: save('alwaysoncharge'),
    },
    /*LANG*/'Buzz on charge': {
      value: s.buzzoncharge,
      format: onOffFormat,
      onchange: save('buzzoncharge'),
    },
    /*LANG*/'Remove Jitter': {
      value: s.removejitter,
      min: 0, max: 1,
      format: v => RM_JITTER_OPTIONS[v],
      onchange: save('removejitter'),
    },
  }
  E.showMenu(menu)
})
