/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = "gbmusic.json",
    storage = require("Storage");

  // initialize with default settings...
  let s = {
    autoStart: true,
    simpleButton: false,
  };
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for(const key in saved) {
    s[key] = saved[key];
  }

  function save(key) {
    return function (value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
    }
  }

  let menu = {
    "": {"title": "Music Control"},
  };
  menu["< Back"] = back;
  menu[/*LANG*/"Auto start"] = {
    value: !!s.autoStart,
    onchange: save("autoStart"),
  };
  menu[/*LANG*/"Simple button"] = {
    value: !!s.simpleButton,
    onchange: save("simpleButton"),
  };

  E.showMenu(menu);
});
