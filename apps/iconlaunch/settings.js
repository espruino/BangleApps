// make sure to enclose the function in parentheses
(function(back) {
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false
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
    }
  };
  E.showMenu(appMenu);
});
