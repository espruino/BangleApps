((back: () => void) => {
  const SETTINGS_FILE = "drained.setting.json";

  const storage = require("Storage")
  const settings = storage.readJSON(SETTINGS_FILE, true) || {};
  settings.battery ??= 5;
  settings.interval ??= 10;

  const save = () => {
    storage.writeJSON(SETTINGS_FILE, settings)
  };

  E.showMenu({
    "": { "title": "Drained" },
    "< Back": back,
    "Trigger when battery reaches": {
      value: settings.battery,
      min: 0,
      max: 95,
      step: 5,
      onchange: (v: number) => {
        settings.battery = v;
        save();
      },
    },
    "Check every N minutes": {
      value: settings.interval,
      min: 1,
      max: 60 * 2,
      step: 5,
      onchange: (v: number) => {
        settings.interval = v;
        save();
      },
    },
  });
})
