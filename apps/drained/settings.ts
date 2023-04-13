type DrainedSettings = {
  battery?: number,
  interval?: number,
};

((back: () => void) => {
  const SETTINGS_FILE = "drained.setting.json";

  const storage = require("Storage")
  const settings: DrainedSettings = storage.readJSON(SETTINGS_FILE, true) || {};
  settings.battery ??= 5;
  settings.interval ??= 10;

  const save = () => {
    storage.writeJSON(SETTINGS_FILE, settings)
  };

  E.showMenu({
    "": { "title": "Drained" },
    "< Back": back,
    "Trigger at batt%": {
      value: settings.battery,
      min: 0,
      max: 95,
      step: 5,
      format: (v: number) => `${v}%`,
      onchange: (v: number) => {
        settings.battery = v;
        save();
      },
    },
    "Poll interval": {
      value: settings.interval,
      min: 1,
      max: 60 * 2,
      step: 5,
      format: (v: number) => `${v} mins`,
      onchange: (v: number) => {
        settings.interval = v;
        save();
      },
    },
  });
})
