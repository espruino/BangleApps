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

  const valuesColors = ["",        "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff",
  "#00ffff", "#fff",  "#000", "green-red",   "red-green", "fg"];
  const namesColors =  ["default", "red",     "green",   "blue",    "yellow",  "magenta",
  "cyan",    "white", "black", "green->red", "red->green", "foreground"];

  const weatherData = ["empty", "humidity", "wind"];

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
      /*LANG*/'circle 1': ()=>showCircleMenu(1),
      /*LANG*/'circle 2': ()=>showCircleMenu(2),
      /*LANG*/'circle 3': ()=>showCircleMenu(3),
      /*LANG*/'circle 4': ()=>showCircleMenu(4),
      /*LANG*/'battery warn': {
        value: settings.batteryWarn,
        min: 10,
        max : 100,
        step: 10,
        format: x => {
          return x + '%';
        },
        onchange: x => save('batteryWarn', x),
      },
      /*LANG*/'show widgets': {
        value: !!settings.showWidgets,
        format: () => (settings.showWidgets ? 'Yes' : 'No'),
        onchange: x => save('showWidgets', x),
      },
      /*LANG*/'weather data': {
        value: weatherData.indexOf(settings.weatherCircleData),
        min: 0, max: 2,
        format: v => weatherData[v],
        onchange: x => save('weatherCircleData', weatherData[x]),
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
      //TODO deprecated local icons, may disappear in future
      /*LANG*/'legacy weather icons': {
        value: !!settings.legacyWeatherIcons,
        format: () => (settings.legacyWeatherIcons ? 'Yes' : 'No'),
        onchange: x => save('legacyWeatherIcons', x),
      },
      /*LANG*/'show big weather': {
        value: !!settings.showBigWeather,
        format: () => (settings.showBigWeather ? 'Yes' : 'No'),
        onchange: x => save('showBigWeather', x),
      }
    };
    E.showMenu(menu);
  }

  function showCircleMenu(circleId) {
    const circleName = "circle" + circleId;
    const colorKey = circleName + "color";
    const colorizeIconKey = circleName + "colorizeIcon";

    const menu = {
      '': { 'title': /*LANG*/'Circle ' + circleId },
      /*LANG*/'< Back': ()=>showMainMenu(),
      /*LANG*/'color': {
        value: valuesColors.indexOf(settings[colorKey]) || 0,
        min: 0, max: valuesColors.length - 1,
        format: v => namesColors[v],
        onchange: x => save(colorKey, valuesColors[x]),
      },
      /*LANG*/'colorize icon': {
        value: settings[colorizeIconKey] || false,
        format: () => (settings[colorizeIconKey] ? 'Yes' : 'No'),
        onchange: x => save(colorizeIconKey, x),
      },
    };
    E.showMenu(menu);
  }

  showMainMenu();
});
