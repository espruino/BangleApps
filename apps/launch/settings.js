(function(back) {
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    height: 52
  }, require("Storage").readJSON("launch.json", true) || {});

  let fonts = g.getFonts().filter(f=>f!="Vector");
  for (var f=10;f<20;f++) fonts.push("Vector"+f);
  let defaultfont = fonts.includes("12x20") ? "12x20" : "6x8:2";
  if (fonts.includes("22")) defaultfont="22"; // 2v26+

  let heights = [28,40,52,64,76];

  function save() {
    require("Storage").write("launch.json",settings);
  }
  function clearCache() {
    require("Storage").erase("launch.cache.json");
  }
  const appMenu = {
    "": { "title": /*LANG*/"Launcher" },
    /*LANG*/"< Back": back,
    /*LANG*/"Font": {
      value: fonts.includes(settings.font)? fonts.indexOf(settings.font) : fonts.indexOf(defaultfont),
      min:0, max:fonts.length-1, step:1,wrap:true,
      onchange: (m) => {
        settings.font=fonts[m];
        save();
      },
      format: v => fonts[v]
     },
    /*LANG*/"Height": {
      value: heights.includes(settings.height) ? heights.indexOf(settings.height) : heights.indexOf(52),
      min:0, max: heights.length-1,step:1,wrap:true,
      format: v => heights[v]+"px",
      onchange: (m) => {
        settings.height=heights[m];
        save();
      }
    },
    /*LANG*/"Show Clocks": {
      value: !!settings.showClocks,
      onchange: (m) => {
        settings.showClocks=m;
        save();
        clearCache();
      }
    },
    /*LANG*/"Fullscreen": {
      value: !!settings.fullscreen,
      onchange: (m) => {
        settings.fullscreen=m;
        save();
      }
    }
  };
  E.showMenu(appMenu);
})
