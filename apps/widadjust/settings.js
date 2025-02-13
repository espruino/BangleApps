(function(back) {
  const SETTINGS_FILE = 'widadjust.json';
  const STATE_FILE = 'widadjust.state';

  const DEFAULT_ADJUST_THRESHOLD = 100;
  let thresholdV = [ 10, 25, 50, 100, 250, 500, 1000 ];

  const DEFAULT_UPDATE_INTERVAL = 60000;
  let intervalV = [  10000,  30000, 60000, 180000, 600000, 1800000, 3600000 ];
  let intervalN = [ "10 s", "30 s", "1 m",  "3 m", "10 m",  "30 m",   "1 h" ];

  let stateFileErased = false;

  let settings = Object.assign({
    advanced: false,
    saveState: true,
    debugLog: false,
    ppm: 0,
    adjustThreshold: DEFAULT_ADJUST_THRESHOLD,
    updateInterval: DEFAULT_UPDATE_INTERVAL,
  }, require('Storage').readJSON(SETTINGS_FILE, true) || {});

  if (thresholdV.indexOf(settings.adjustThreshold) == -1) {
    settings.adjustThreshold = DEFAULT_ADJUST_THRESHOLD;
  }

  if (intervalV.indexOf(settings.updateInterval) == -1) {
    settings.updateInterval = DEFAULT_UPDATE_INTERVAL;
  }

  function onPpmChange(v) {
    settings.ppm = v;
    mainMenu['PPM x 10' ].value = v;
    mainMenu['PPM x 1'  ].value = v;
    mainMenu['PPM x 0.1'].value = v;
  }

  let mainMenu = {
    '': { 'title' : 'Adjust Clock' },

    '< Back': () => {
      require('Storage').writeJSON(SETTINGS_FILE, settings);
      back();
    },

    /*
    // NOT FULLY WORKING YET
    'Mode': {
      value: settings.advanced,
      format: v => v ? 'Advanced' : 'Basic',
      onchange: () => {
        settings.advanced = !settings.advanced;
      }
    },
    */

    'PPM x 10' : {
      value: settings.ppm,
      format: v => v.toFixed(1),
      step: 10,
      onchange : onPpmChange,
    },

    'PPM x 1' : {
      value: settings.ppm,
      format: v => v.toFixed(1),
      step: 1,
      onchange : onPpmChange,
    },

    'PPM x 0.1' : {
      value: settings.ppm,
      format: v => v.toFixed(1),
      step: 0.1,
      onchange : onPpmChange,
    },

    'Update Interval': {
      value: intervalV.indexOf(settings.updateInterval),
      min: 0,
      max: intervalV.length - 1,
      format: v => intervalN[v],
      onchange: v => settings.updateInterval = intervalV[v] ,
    },

    'Threshold': {
      value: thresholdV.indexOf(settings.adjustThreshold),
      min: 0,
      max: thresholdV.length - 1,
      format: v => thresholdV[v] + " ms",
      onchange: v => {
        settings.adjustThreshold = thresholdV[v];
      },
    },

    'Save State': {
      value: settings.saveState,
      onchange: (v) => {
        settings.saveState = v;
        if (!v && !stateFileErased) {
          stateFileErased = true;
          require("Storage").erase(STATE_FILE);
        }
      },
    },

    'Debug Log': {
      value: settings.debugLog,
      onchange: v => settings.debugLog = v,
    },

    'Hide Widget': {
      value: settings.hide || false,
      onchange: v => settings.hide = v,
    },
  };

  E.showMenu(mainMenu);
})
