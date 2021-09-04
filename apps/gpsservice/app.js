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
  var power_options = ["SuperE","PSMOO"];

  const mainmenu = {
    '': { 'title': 'GPS Service' },
    '< Exit': ()=>{load();},
    'GPS': {
      value: !!settings.gpsservice,
      format: v =>v?'On':'Off',
      onchange: v => {
        settings.gpsservice = v;
	updateSettings();
	reloadWidget();  // only when we change On/Off status
      },
    },

    'Power Mode': {
      value: 0 | power_options.indexOf(settings.power_mode),
      min: 0, max: 1,
      format: v => power_options[v],
      onchange: v => {
        settings.power_mode = power_options[v];
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
	settings.search = v;
	updateSettings();
      }
    },
    '< Back': ()=>{load();}
  };

  return E.showMenu(mainmenu);
}

showMainMenu();
