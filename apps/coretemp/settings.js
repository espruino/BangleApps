// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'coretemp.json'
  // initialize with default settings...
  let s = {
    'enabled': true,
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

  function updateSettings() {
  require("Storage").write("coretemp.json", s);
  if (WIDGETS["coretemp"])
    WIDGETS["coretemp"].reload();
  return;
} 

const menu = {
  '' : {'title' : 'CoreTemp sensor'},
  '< Back' : back,
  'Enabled' : {
    value : !!s.enabled,
    format : v => v ? "Yes" : "No",
    onchange : v => {
      s.enabled = v;
      updateSettings();
    }
  }
}

  E.showMenu(menu);
})
