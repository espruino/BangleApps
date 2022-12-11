/**
 * Add setting items to a menu
 *
 * @param {object} menu Menu to add items to
 * @param {function} callback Callback when value changes
 * @param {object} items Menu items to add, with their current value
 */
exports.addItems = function(menu, callback, items) {
  Object.keys(items).forEach(key => {
    let value = items[key];
    const label = {
      showDate:/*LANG*/"Show date",
      loadWidgets:/*LANG*/"Load widgets",
      powerSave:/*LANG*/"Power saving",
    }[key];
    switch(key) {
      // boolean options which default to true
      case "showDate":
      case "loadWidgets":
        if (value===undefined) value = true;
        // fall through
      case "powerSave":
        // same for all boolean options:
        menu[label] = {
          value: !!value,
          onchange: v => callback(key, v),
        };
    }
  });
};

/**
 * Create a basic settings menu for app, reading/writing to settings file
 *
 * @param {object} menu Menu to add settings to
 * @param {string} settingsFile File to read/write settings to/from
 * @param {string[]} items List of settings to add
 */
exports.addSettingsFile = function(menu, settingsFile, items) {
  let s = require("Storage").readJSON(settingsFile, true) || {};

  function save(key, value) {
    s[key] = value;
    require("Storage").writeJSON(settingsFile, s);
  }

  let toAdd = {};
  items.forEach(function(key) {
    toAdd[key] = s[key];
  });
  exports.addItems(menu, save, toAdd);
};