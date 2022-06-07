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
    }[key];
    switch(key) {
      case "showDate":
      case "loadWidgets":
        // boolean options, which default to true
        if (value===undefined) value = true;
        menu[label] = {
          value: !!value,
          onchange: v => callback(key, v),
        };
    }
  });
};