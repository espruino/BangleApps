/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = "widbatwarn.json";
  const storage = require("Storage");

  // initialize with default settings...
  let s = {
    buzz: true,
    percentage: 10,
  };
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for(const key in saved) {
    s[key] = saved[key];
  }

  // creates a function to safe a specific setting, e.g.  save('buzz')(true)
  function save(key) {
    return function(value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
      WIDGETS["batwarn"].reload();
    };
  }

  const menu = {
    "": {"title": "Battery Warning"},
    "< Back": back,
    "Percentage": {
      value: s.percentage,
      min: 5,
      max: 100,
      step: 5,
      onchange: save("percentage"),
    },
    "Buzz": {
      value: s.buzz,
      onchange: save("buzz"),
    },
  };
  E.showMenu(menu);
})
