(function(back) {
  let s = require("Storage").readJSON("barclock.settings.json", true) || {};

  function save(key, value) {
    s[key] = value;
    require("Storage").writeJSON("barclock.settings.json", s);
  }

  const fonts = [/*LANG*/"Bitmap",/*LANG*/"Vector"];
  let menu = {
    "": {"title": /*LANG*/"Bar Clock"},
    /*LANG*/"< Back": back,
    /*LANG*/"Font": {
      value: s.font|0,
      min: 0, max: 1, wrap: true,
      format: v => fonts[v],
      onchange: v => save("font", v),
    },
  };
  let items = {
    showDate: s.showDate,
    loadWidgets: s.loadWidgets,
  };
  // Power saving for Bangle.js 1 doesn't make sense (no updates while screen is off anyway)
  if (process.env.HWVERSION>1) {
    items.powerSave = s.powerSave;
  }
  require("ClockFace_menu").addItems(menu, save, items);
  E.showMenu(menu);
});
