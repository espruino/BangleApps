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
  require("ClockFace_menu").addItems(menu, save, {
    showDate: s.showDate,
    loadWidgets: s.loadWidgets,
  });

  E.showMenu(menu);
});
