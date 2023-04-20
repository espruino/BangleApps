type DrainedSettings = {
  battery?: number,
  restore?: number,
  interval?: number,
  disableBoot?: ShortBoolean,
};

(back => {
  const SETTINGS_FILE = "drained.setting.json";

  const storage = require("Storage")
  const settings: DrainedSettings = storage.readJSON(SETTINGS_FILE, true) || {};
  settings.battery ??= 5;
  settings.restore ??= 20;
  settings.interval ??= 10;
  settings.disableBoot ??= false;

  const save = () => {
    storage.writeJSON(SETTINGS_FILE, settings)
  };

  E.showMenu({
    "": { "title": "Drained" },
    "< Back": back,
    "Keep startup code": {
      value: settings.disableBoot,
      format: () => settings.disableBoot ? "No" : "Yes",
      onchange: () => {
        settings.disableBoot = !settings.disableBoot;
        save();
      },
    },
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
    "Restore watch at %": {
      value: settings.restore,
      min: 0,
      max: 95,
      step: 5,
      format: (v: number) => `${v}%`,
      onchange: (v: number) => {
        settings.restore = v;
        save();
      },
    },
  });
}) satisfies SettingsFunc
