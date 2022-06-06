(function(back) {
  let s = require('Storage').readJSON("barclock.settings.json", true) || {};

  function saver(key) {
    return value => {
      s[key] = value;
      require('Storage').writeJSON("barclock.settings.json", s);
    }
  }

  const fonts = [/*LANG*/"Bitmap",/*LANG*/"Vector"];
  const menu = {
    "": {"title": /*LANG*/"Bar Clock"},
    /*LANG*/"< Back": back,
    /*LANG*/"Show date": require("ClockFace_menu").showDate(s.showDate, saver('showDate')),
    /*LANG*/"Load widgets": require("ClockFace_menu").loadWidgets(s.loadWidgets, saver('loadWidgets')),
    /*LANG*/"Font": {
      value: s.font|0,
      min:0,max:1,wrap:true,
      format:v=>fonts[v],
      onchange:saver('font'),
    },
  };

  E.showMenu(menu);
});
