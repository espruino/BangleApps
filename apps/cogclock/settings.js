(function(back) {
  let s = require('Storage').readJSON("cogclock.settings.json", true) || {};

  function save(key, value) {
    s[key] = value;
    require("Storage").writeJSON("cogclock.settings.json", s);
  }

  let menu = {
    "": {"title": /*LANG*/"Cog Clock"},
    /*LANG*/"< Back": back,
  };
  require("ClockFace_menu").addItems(menu, save, {
    showDate: s.showDate,
    loadWidgets: s.loadWidgets,
  });

  E.showMenu(menu);
});
