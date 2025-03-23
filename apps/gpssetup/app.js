/*
 * GPS Setup app, hughbarney AT googlemail DOT com
 * With thanks to Gordon Williams for support and advice
 *
 * UBLOX power modes:
 *   SuperE - will provide updates every second and consume 35mA, 75mA with LCD on
 *   PSMOO -  will sleep for update time and consume around 7mA during that period
 *            after acquiring satelite fixes the GPS will settle into a cycle of
 *            obtaining fix, sleeping for update seconds, wake up, get fix and sleep.
 *
 * See README file for more details
 *
 */

Bangle.loadWidgets();
Bangle.drawWidgets();

function log_debug(o) {
  //let timestamp = new Date().getTime();
  //console.log(timestamp + " : " + o);
}

const SETTINGS_FILE = "gpssetup.settings.json";
let settings = undefined;
let settings_changed = false;

function updateSettings() {
  require("Storage").write(SETTINGS_FILE, settings);
  settings_changed = true;
}

function loadSettings() {
  log_debug("loadSettings()");
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  settings.update = settings.update||120;
  settings.search = settings.search||5;
  settings.fix_req = settings.fix_req||1;
  settings.power_mode = settings.power_mode||"SuperE";
  log_debug(settings);
}

/***********  GPS Power and Setup Functions  ******************/

function setupGPS() {
  Bangle.setGPSPower(1);
  setTimeout(function() {
    require("gpssetup").setPowerMode().then(function() {
      Bangle.setGPSPower(0);
    });
  }, 100);
}

/***********  GPS Setup Menu App  *****************************/

function showMainMenu() {
  var power_options = ["SuperE","PSMOO"];

  const mainmenu = {
    '': { 'title': 'GPS Setup' },
    '< Back': ()=>{exitSetup();},
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
        settings.update = v;
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
    'Fix Req (#)': {
      value: settings.fix_req,
      min: 1,
      max: 100,
      step: 1,
      onchange: v => {
        settings.fix_req = v;
        updateSettings();
      }
    }
  };

  return E.showMenu(mainmenu);
}

function exitSetup() {
  log_debug("exitSetup()");
  if (settings_changed) {
    log_debug(settings);
    E.showMessage("Configuring GPS");
    setTimeout(function() {
      setupGPS();
      setTimeout(function() { load() }, 750);
    }, 500);
  } else {
    load();
  }
}

loadSettings();
showMainMenu();
