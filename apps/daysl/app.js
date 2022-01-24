g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

const storage = require('Storage');
let settings;

function updateSettings() {
  storage.write('daysleft.json', settings);
}

function resetSettings() {
  settings = {
    day : 17,
    month : 6,
    year: 1981
  };
  updateSettings();
}

settings = storage.readJSON('daysleft.json',1);
if (!settings) resetSettings();

function showMenu() {
  const datemenu = {
    '': {
      'title': 'Set Date'
    },
    'Day': {
      value: settings.day,
      min: 1,
      max: 31,
      step: 1,
      onchange: v => {
        settings.day = v;
        updateSettings();
      }
    },
    'Month': {
      value: settings.month,
      min: 1,
      max: 12,
      step: 1,
      onchange: v => {
        settings.month = v;
        updateSettings();
      }
    },
    'Year': {
      value: settings.year,
      step: 1,
      onchange: v => {
        settings.year = v;
        updateSettings();
      }
    }
  };
  datemenu['-Exit-'] =  ()=>{load();};
  return E.showMenu(datemenu);
}

showMenu();
