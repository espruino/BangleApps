/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = "gbmusic.json",
    storage = require("Storage"),
    translate = require("locale").translate;
  const TOUCH_OPTIONS = ["Off", "When LCD on", "Always"];

  // initialize with default settings...
  let s = {
    autoStart: true,
    touch: 1,
  };
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for(const key in saved) {
    s[key] = saved[key];
  }

  function save(key, value) {
    s[key] = value;
    storage.write(SETTINGS_FILE, s);
  }

  let menu = {
    "": {"title": "Music Control"},
  };
  menu[translate("< Back")] = back;
  menu[translate("Auto start")] = {
    value: s.autoStart,
    format: v => translate(v ? "Yes" : "No"),
    onchange: v => {save("autoStart", v);},
  };
  menu[translate("Touch")] = {
    value: s.touch|0,
    format: v => translate(TOUCH_OPTIONS[(v+3)%3]),
    onchange: v => {save("touch", (v+3)%3);},
  };

  E.showMenu(menu);
});
