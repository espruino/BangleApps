const storage = require('Storage');
let settings;

function updateSettings() {
  storage.write('hourstrike.json', settings);
}

function resetSettings() {
  settings = {
    interval: 3600,
    start: 9,
    end: 21,
  };
  updateSettings();
}

settings = storage.readJSON('hourstrike.json', 1);
if (!settings) resetSettings();

function showMainMenu() {
  var mode_txt = ['Off', 'Hour', 'Half', 'Quarter'];
  var mode_interval = [-1, 3600, 1800, 900];
  const mainmenu = {
    '': { 'title': 'Hour Strike' },
    'Mode': {
      value: mode_interval.indexOf(settings.mode),
      format: v => mode_txt[v],
      onchange: v => {
        settings.interval = mode_interval[v];
        updateSettings();
      }
    },
    'Start': {
      value: settings.start_hour,
      min: 0, max: 23,
      format: v => v+':00',
      onchange: v=> {
        settings.start_hour = v;
        updateSettings();
      }
    },
    'End hour': {
      value: settings.end_hour,
      min: 0, max: 23,
      format: v => v+':59',
      onchange: v=> {
        settings.end_hour = v;
        updateSettings();
      }
    },
    '< Back': ()=>load()
  };
  return E.showMenu(mainmenu);
}

showMainMenu();
