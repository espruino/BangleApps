/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = "widhrm.json";
  const storage = require("Storage");

  let s = {
    confidence: 0
  };
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for(const key in saved) {
    s[key] = saved[key];
  }

  function save(key, value) {
    s[key] = value;
    storage.write(SETTINGS_FILE, s);
  }

  const menu = {
    "": {"title": "Simple Heart Rate widget"},
    "< Back": back,
    /*LANG*/'min. confidence': {
        value: s.confidence,
        min: 0,
        max : 100,
        step: 5,
        format: x => {
          return x + "%";
        },
        onchange: x => save('confidence', x),
     },
  };
  E.showMenu(menu);
})
