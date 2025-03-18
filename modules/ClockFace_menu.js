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
      hideWidgets:/*LANG*/"Widgets",
      powerSave:/*LANG*/"Power saving",
    }[key];
    switch(key) {
      // boolean options which default to true
      case "showDate":
        if (value===undefined) value = true;
        // fall through
      case "powerSave":
        // same for all boolean options:
        menu[label] = {
          value: !!value,
          onchange: v => callback(key, v),
        };
        break;

      case "hideWidgets": {
        let options = [/*LANG*/"Show",/*LANG*/"Hide"];
        if (process.env.HWVERSION===2) options.push(/*LANG*/"Swipe");
        menu[label] = {
          value: value|0,
          min: 0, max: options.length-1,
          format: v => options[v|0],
          onchange: v => callback(key, v),
        };
      }
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

  // migrate "don't load widgets" to "hide widgets"
  if (!("hideWidgets" in s) && ("loadWidgets" in s) && !s.loadWidgets) {
    s.hideWidgets = 1;
  }
  delete s.loadWidgets;

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