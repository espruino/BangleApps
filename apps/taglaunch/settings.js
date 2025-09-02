// make sure to enclose the function in parentheses
(function(back) {
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    buzz:false
  }, require("Storage").readJSON("taglaunch.json", true) || {});

  let fonts = g.getFonts();
  function save(key, value) {
    settings[key] = value;
    require("Storage").write("taglaunch.json",settings);
  }
  const appMenu = {
    "": { "title": /*LANG*/"Tag Launcher" },
    "< Back": back,
    /*LANG*/"Font": {
      value: fonts.includes(settings.font)? fonts.indexOf(settings.font) : fonts.indexOf("12x20"),
      min:0, max:fonts.length-1, step:1,wrap:true,
      onchange: (m) => {save("font", fonts[m])},
      format: v => fonts[v]
     },
    /*LANG*/"Vector Font Size": {
      value: settings.vectorsize || 10,
      min:10, max: 25,step:1,wrap:true,
      onchange: (m) => {save("vectorsize", m)}
    },
    /*LANG*/"Haptic Feedback": {
      value: settings.buzz == true,
      onchange: (m) => {
        save("buzz", m);
        
      }
    },
    /*LANG*/"Show Clocks": {
      value: settings.showClocks == true,
      onchange: (m) => {
        save("showClocks", m);
        require("Storage").erase("taglaunch.cache.json"); //delete the cache app list
       }
    },
    /*LANG*/"Fullscreen": {
      value: settings.fullscreen == true,
      onchange: (m) => { save("fullscreen", m) }
    }
  };
  E.showMenu(appMenu);
})
