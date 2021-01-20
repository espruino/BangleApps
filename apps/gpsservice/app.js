Bangle.loadWidgets();
Bangle.drawWidgets();

const SETTINGS_FILE = "gpsservice.settings.json";
let settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};



function updateSettings() {
  require("Storage").write(SETTINGS_FILE, settings);
}

function reloadWidget() {
  if (WIDGETS.gpsservice)
    WIDGETS.gpsservice.reload();
}

function showMainMenu() {
  var powerV = [0,1];
  var powerN = ["PMS","PSMOO"];

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

    'Power Mode': {
      value: 0 | powerV.indexOf(settings.power),
      min: 0, max: 1,
      format: v => powerN[v],
      onchange: v => {
        settings.power = powerV[v];
	updateSettings();
      },
    },

    'Update (s)': {
      value: settings.update,
      min: 10,
      max: 1800,
      step: 10,
      onchange: v => {
	settings.period =v;
	updateSettings();
      }
    },
    'Search (s)': {
      value: settings.search,
      min: 1,
      max: 65,
      step: 1,
      onchange: v => {
	settings.ontime = v;
	updateSettings();
      }
    },
    '< Back': ()=>{load();}
  };

  return E.showMenu(mainmenu);
}

showMainMenu();
