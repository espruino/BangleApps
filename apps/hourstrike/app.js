const storage = require('Storage');
let settings;

function updateSettings() {
  storage.write('hourstrike.json', settings);
}

function resetSettings() {
  settings = {
    on_hour: true,
    on_half_hour: true,
    start_hour: 9,
    end_hour: 21,
  };
  updateSettings();
}

settings = storage.readJSON('hourstrike.json', 1);
if (!settings) resetSettings();

function showMainMenu() {
  var mode = ['off', 'v', 'b', 'vb', 'bv'];
  const mainmenu = {
    '': { 'title': 'Time Passed' },
    'On hour': {
      value: settings.on_hour,
      format: v => v?"ON":"OFF",
      onchange: v => {
        settings.on_hour = v;
        updateSettings();
      }
    },
    'On half hour': {
      value: settings.on_half_hour,
      format: v => v?"ON":"OFF",
      onchange: v => {
        settings.on_half_hour = v;
        updateSettings();
      }
    },
    'Start hour': {
      value: settings.start_hour,
      min: 0, max: 23,
      onchange: v=> {
        settings.start_hour = v;
        updateSettings();
      }
    },
    'End hour': {
      value: settings.end_hour,
      min: 0, max: 23,
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