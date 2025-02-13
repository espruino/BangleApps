(function(back) {
  const SETTINGS_FILE = "circlesclock.json";
  const storage = require('Storage');
  const clock_info = require("clock_info");
  let settings = Object.assign(
    storage.readJSON("circlesclock.default.json", true) || {},
    storage.readJSON(SETTINGS_FILE, true) || {}
  );

  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }

  const valuesColors = ["", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff",
  "#00ffff", "#fff", "#000", "green-red", "red-green", "blue-red", "red-blue", "fg"];
  const namesColors =  ["default", "red", "green", "blue", "yellow", "magenta",
  "cyan", "white", "black", "green->red", "red->green",  "blue->red", "red->blue", "foreground"];

  function showMainMenu() {
    let menu ={
      '': { 'title': 'Circles clock' },
      /*LANG*/'< Back': back,
      /*LANG*/'circle count': {
        value:  settings.circleCount,
        min: 3,
        max : 4,
        step: 1,
        onchange: x => save('circleCount', x),
      },
      /*LANG*/'show widgets': {
        value: !!settings.showWidgets,
        onchange: x => save('showWidgets', x),
      },
      /*LANG*/'update interval': {
        value: settings.updateInterval,
        min: 0,
        max : 3600,
        step: 30,
        format: x => {
          return x + 's';
        },
        onchange: x => save('updateInterval', x),
      },
      /*LANG*/'show big weather': {
        value: !!settings.showBigWeather,
        onchange: x => save('showBigWeather', x),
      },
      /*LANG*/'colorize icons': ()=>showCircleMenus()
    };
    clock_info.load().forEach(e=>{
      if(e.dynamic) {
        const colorKey = e.name + "_color";
        menu[e.name+/*LANG*/' color'] = {
          value: valuesColors.indexOf(settings[colorKey]) || 0,
          min: 0, max: valuesColors.length - 1,
          format: v => namesColors[v],
          onchange: x => save(colorKey, valuesColors[x]),
        };
      } else {
        let values = e.items.map(i=>e.name+"/"+i.name);
        let names = e.name=="Bangle" ? e.items.map(i=>i.name) : values;
        values.forEach((v,i)=>{
          const colorKey = v + "_color";
          menu[names[i]+/*LANG*/' color'] = {
            value: valuesColors.indexOf(settings[colorKey]) || 0,
            min: 0, max: valuesColors.length - 1,
            format: v => namesColors[v],
            onchange: x => save(colorKey, valuesColors[x]),
          };
        });
      }
    })
    E.showMenu(menu);
  }

  function showCircleMenus() {
      const menu = {
        '': { 'title': /*LANG*/'Colorize icons'},
        /*LANG*/'< Back': ()=>showMainMenu(),
      };
    for(var circleId=1; circleId<=4; ++circleId) {
      const circleName = "circle" + circleId;
      //const colorKey = circleName + "color";
      const colorizeIconKey = circleName + "colorizeIcon";
      menu[/*LANG*/'circle ' + circleId] = {
        value: settings[colorizeIconKey] || false,
        onchange: x => save(colorizeIconKey, x),
      };
    }
    E.showMenu(menu);
  }

  showMainMenu();
})
