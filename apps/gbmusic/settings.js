/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = "gbmusic.json",
    storage = require("Storage"),
    translate = require("locale").translate;

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

  const yesNo = (v) => translate(v ? "Yes" : "No");
  let menu = {
    "": {"title": "Music Control"},
  };
  menu[translate("< Back")] = back;
  menu[translate("Auto start")] = {
    value: !!s.autoStart,
    format: yesNo,
    onchange: save("autoStart"),
  };
  menu[translate("Simple button")] = {
    value: !!s.simpleButton,
    format: yesNo,
    onchange: save("simpleButton"),
  };

  E.showMenu(menu);
});
