/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = "widsleepstatus.json";
  const storage = require("Storage");

  let s = {
    hidewhenawake: true
  };
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for(const key in saved) {
    s[key] = saved[key];
  }

  function save(key) {
    return function(value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
    };
  }

  const menu = {
    "": {"title": "Sleep Status Widget"},
    "< Back": back,
    "Hide when awake": {
      value: s.hidewhenawake,
      onchange: save("hidewhenawake"),
    },
  };
  E.showMenu(menu);
})
