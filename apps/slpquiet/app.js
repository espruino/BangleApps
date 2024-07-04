const SETTINGS_FILE = "quietSwitch.json";
const storage = require("Storage");

//check if settings file exists and create if missing
if (storage.read(SETTINGS_FILE)=== undefined) {
  print("data file not existing, using defaults");
  let saved = {
    quietWhenSleep: 0, //off
    quietMode: 1, //alerts
  };
  storage.writeJSON(SETTINGS_FILE,saved);
}

let saved = storage.readJSON(SETTINGS_FILE, 1) || {};

// Main menu
var mainmenu = {
  "": {
    "title": "Quiet Switch"
  },

  "Quiet Switch": {
    value: saved.quietWhenSleep,
    format: v => v ? "On" : "Off",
    min: 0, max: 1, step: 1,
    onchange: v => {
      saved.quietWhenSleep = v;
      storage.writeJSON(SETTINGS_FILE, saved);
    }
  },
  "Quiet Mode": {
    value: saved.quietMode,
    format: v => v ? "Alerts" : "Silent",
    min: 0, max: 1, step: 1,
    onchange: v => {
      saved.quietMode = v;
      storage.writeJSON(SETTINGS_FILE, saved);
    }
  },
  "Exit": function () { load(); },
};

// Actually display the menu
E.showMenu(mainmenu);
