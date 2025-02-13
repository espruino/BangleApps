(function(back) {
  let settings = require("Storage").readJSON("saclock.settings.json", true)||{};
  function save(key, value) {
    settings[key] = value;
    require("Storage").writeJSON("saclock.settings.json", settings);
  }

  let menu = {
    "": {"title": /*LANG*/"Analog Clock"},
    /*LANG*/"< Back": back
  };
  if (process.env.HWVERSION>1) { // Bangle.js 1 memory won't fit a coloured graphics buffer
    menu[/*LANG*/"Monochrome"] = {
        // saved as "multicol" so the default is monochrome (as in previous version)
        value: !settings.multicol,
        onchange: v => save("multicol", !v),
    }
  }
  require("ClockFace_menu").addItems(menu, save, {
    hideWidgets: settings.hideWidgets,
  });
  E.showMenu(menu);
})
