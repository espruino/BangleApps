/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = "gbmusic.json",
    storage = require("Storage"),
    translate = require("locale").translate

  // initialize with default settings...
  let s = {
    autoStart: true,
  }
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {}
  for(const key in saved) {
    s[key] = saved[key]
  }

  // creates a function to safe a specific setting, e.g.  save('autoStart')(true)
  function save(key) {
    return function(value) {
      s[key] = value
      storage.write(SETTINGS_FILE, s)
    }
  }

  const menu = {
    "": {"title": "Music Control"},
    "< Back": back,
    "Auto start": {
      value: s.autoStart,
      format: v => translate(v ? "Yes" : "No"),
      onchange: save("autoStart"),
    }
  }
  E.showMenu(menu)
})
