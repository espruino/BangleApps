(function(back) {
  const storage = require('Storage');
  let settings = storage.readJSON('clicompleteclk.json', 1) || {};
  function save(key, value) {
    settings[key] = value;
    storage.write('clicompleteclk.json', settings);
  }
  E.showMenu({
    '': { 'title': 'CLI complete clk' },
    'Show battery': {
      value: "battery" in settings ? settings.battery : false,
      onchange: () => {
        settings.battery = !settings.battery;
        save('battery', settings.battery);
      },
    },
    'Battery warn': {
      value: "batteryLvl" in settings ? settings.batteryLvl : 30,
      min: 0,
      max : 100,
      step: 10,
      format: x => {
        return x + "%";
      },
      onchange: x => save('batteryLvl', x),
    },
    'Show weather': {
      value: "weather" in settings ? settings.weather : false,
      onchange: () => {
        settings.weather = !settings.weather;
        save('weather', settings.weather);
      },
    },
    'Show steps': {
      value: "steps" in settings ? settings.steps : false,
      onchange: () => {
        settings.steps = !settings.steps;
        save('steps', settings.steps);
      },
    },
    'Show heartrate': {
      value: "heartrate" in settings ? settings.heartrate : false,
      onchange: () => {
        settings.heartrate = !settings.heartrate;
        save('heartrate', settings.heartrate);
      },
    },
    '< Back': back,
  });
})
