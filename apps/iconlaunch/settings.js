// make sure to enclose the function in parentheses
(function(back) {
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    direct: false,
    oneClickExit: false,
    swipeExit: false,
    fastload: false
  }, require("Storage").readJSON("launch.json", true) || {});

  let fonts = g.getFonts();
  function save(key, value) {
    settings[key] = value;
    require("Storage").write("launch.json",settings);
  }
  const appMenu = {
    "": { "title": /*LANG*/"Launcher" },
    /*LANG*/"< Back": back,
    /*LANG*/"Show Clocks": {
      value: settings.showClocks == true,
      onchange: (m) => { save("showClocks", m) }
    },
    /*LANG*/"Fullscreen": {
      value: settings.fullscreen == true,
      onchange: (m) => { save("fullscreen", m) }
    },
    /*LANG*/"Direct launch": {
      value: settings.direct == true,
      onchange: (m) => { save("direct", m) }
    },
    /*LANG*/"One click exit": {
      value: settings.oneClickExit == true,
      onchange: (m) => { save("oneClickExit", m) }
    },
    /*LANG*/"Swipe exit": {
      value: settings.swipeExit == true,
      onchange: m => { save("swipeExit", m) }
    },
    /*LANG*/"Fastload": {
      value: settings.fastload == true,
      onchange: (m) => { save("fastload", m) }
    }
  };
  E.showMenu(appMenu);
});
