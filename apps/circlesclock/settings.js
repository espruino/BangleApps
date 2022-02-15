(function(back) {
  const SETTINGS_FILE = "circlesclock.json";
  const storage = require('Storage');
  let settings = Object.assign(
    storage.readJSON("circlesclock.default.json", true) || {},
    storage.readJSON(SETTINGS_FILE, true) || {}
  );

  function save(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }

  const valuesCircleTypes = ["empty", "steps", "stepsDist", "hr", "battery", "weather", "sunprogress", "temperature", "pressure", "altitude"];
  const namesCircleTypes = ["empty", "steps", "distance", "heart", "battery", "weather", "sun", "temperature", "pressure", "altitude"];

  const valuesColors = ["",        "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#fff",  "#000", "green-red",   "red-green"];
  const namesColors =  ["default", "red",     "green",   "blue",    "yellow",  "magenta", "cyan",    "white", "black", "green->red", "red->green"];

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
      /*LANG*/'heartrate': ()=>showHRMenu(),
      /*LANG*/'steps': ()=>showStepMenu(),
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
      }
    };
    E.showMenu(menu);
  }

  function showHRMenu() {
    let menu = {
      '': { 'title': /*LANG*/'Heartrate' },
      /*LANG*/'< Back': ()=>showMainMenu(),
      /*LANG*/'minimum': {
        value: settings.minHR,
        min: 0,
        max : 250,
        step: 5,
        format: x => {
          return x + " bpm";
        },
        onchange: x => save('minHR', x),
      },
      /*LANG*/'maximum': {
        value: settings.maxHR,
        min: 20,
        max : 250,
        step: 5,
        format: x => {
          return x + " bpm";
        },
        onchange: x => save('maxHR', x),
      },
      /*LANG*/'min. confidence': {
        value: settings.confidence,
        min: 0,
        max : 100,
        step: 10,
        format: x => {
          return x + "%";
        },
        onchange: x => save('confidence', x),
      },
      /*LANG*/'valid period': {
        value: settings.hrmValidity,
        min: 10,
        max : 600,
        step: 10,
        format: x => {
          return x + "s";
        },
        onchange: x => save('hrmValidity', x),
      },
    };
    E.showMenu(menu);
  }

  function showStepMenu() {
    let menu = {
      '': { 'title': /*LANG*/'Steps' },
      /*LANG*/'< Back': ()=>showMainMenu(),
      /*LANG*/'goal': {
        value: settings.stepGoal,
        min: 2000,
        max : 50000,
        step: 2000,
        format: x => {
          return x;
        },
        onchange: x => save('stepGoal', x),
      },
      /*LANG*/'distance goal': {
        value: settings.stepDistanceGoal,
        min: 2000,
        max : 30000,
        step: 1000,
        format: x => {
          return x;
        },
        onchange: x => save('stepDistanceGoal', x),
      },
      /*LANG*/'step length': {
        value: settings.stepLength,
        min: 0.1,
        max : 1.5,
        step: 0.01,
        format: x => {
          return x;
        },
        onchange: x => save('stepLength', x),
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
      /*LANG*/'data': {
        value: valuesCircleTypes.indexOf(settings[circleName]),
        min: 0, max: valuesCircleTypes.length - 1,
        format: v => namesCircleTypes[v],
        onchange: x => save(circleName, valuesCircleTypes[x]),
      },
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
