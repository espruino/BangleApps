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
    /*LANG*/"Font": {
      value: fonts.includes(settings.font)? fonts.indexOf(settings.font) : fonts.indexOf("12x20"),
      min:0, max:fonts.length-1, step:1,wrap:true,
      onchange: (m) => {save("font", fonts[m])},
      format: v => fonts[v]
     },
    /*LANG*/"Vector Font Size": {
      value: settings.vectorsize || 10,
      min:10, max: 20,step:1,wrap:true,
      onchange: (m) => {save("vectorsize", m)}
    },
    /*LANG*/"Show Clocks": {
      value: settings.showClocks == true,
      format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
      onchange: (m) => { save("showClocks", m) }
    },
    /*LANG*/"Fullscreen": {
      value: settings.fullscreen == true,
      format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
      onchange: (m) => { save("fullscreen", m) }
    }
  };
  E.showMenu(appMenu);
});
