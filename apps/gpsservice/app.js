Bangle.loadWidgets();
Bangle.drawWidgets();

const SETTINGS_FILE = "gpsservice.settings.json";
const POWER_OPTIONS = ['SuperE', 'PSMOO'];
let settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};

function updateSettings() {
  require("Storage").write(SETTINGS_FILE, settings);
}

function reloadWidget() {
  if (WIDGETS.gpsservice)
    WIDGETS.gpsservice.reload();
}

function showMainMenu() {
  const mainmenu = {
    '': { 'title': 'GPS Service' },
    '< Exit': ()=>{load();},
    'GPS': {
      value: !!settings.service,
      format: v =>v?'On':'Off',
      onchange: v => {
        settings.service = v;
	updateSettings();
	reloadWidget();  // only when we change On/Off status
      },
    },
    'Period (s)': {
      value: settings.period,
      min: 1,
      max: 1800,
      step: 1,
      onchange: v => {
	settings.period =v;
	updateSettings();
      }
    },
    'Ontime (s)': {
      value: settings.ontime,
      min: 1,
      max: 65,
      step: 1,
      onchange: v => {
	settings.ontime = v;
	updateSettings();
      }
    },
    'Rate (s)': {
      value: settings.period,
      min: 1,
      max: 60,
      step: 1,
      onchange: v => {
	settings.rate = v;
	updateSettings();
      }
    },

    '< Back': ()=>{load();}
  };

  return E.showMenu(mainmenu);
}

showMainMenu();
