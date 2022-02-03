// make sure to enclose the function in parentheses
(function(back) {
  let settings = Object.assign({ showClocks: true }, require("Storage").readJSON("launch.json", true) || {});

  let fonts = g.getFonts();
  function save(key, value) {
    settings[key] = value;
    require("Storage").write("launch.json",settings);
  }
  const appMenu = {
    "": {"title": "Launcher Settings"},
    "< Back": back,
    "Font": {
      value: fonts.includes(settings.font)? fonts.indexOf(settings.font) : fonts.indexOf("12x20"),
      min:0, max:fonts.length-1, step:1,wrap:true,
      onchange: (m) => {save("font", fonts[m])},
      format: v => fonts[v]
     },
    "Vector font size": {
      value: settings.vectorsize || 10,
      min:10, max: 20,step:1,wrap:true,
      onchange: (m) => {save("vectorsize", m)}
    },
    "Show clocks": {
      value: settings.showClocks == true,
      format: v => v ? "Yes" : "No",
      onchange: (m) => {save("showClocks", m)}
    }
  };
  E.showMenu(appMenu);
});
