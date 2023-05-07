type DrainedSettings = {
  battery?: number,
  restore?: number,
  interval?: number,
  keepStartup?: ShortBoolean,
};

(back => {
  const SETTINGS_FILE = "drained.setting.json";

  const storage = require("Storage")
  const settings: DrainedSettings = storage.readJSON(SETTINGS_FILE, true) || {};
  settings.battery ??= 5;
  settings.restore ??= 20;
  settings.interval ??= 10;
  settings.keepStartup ??= true;

  const save = () => {
    storage.writeJSON(SETTINGS_FILE, settings)
  };

  const formatBool = (b: boolean) => b ? "On" : "Off";

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
    "Keep startup code": {
      value: settings.keepStartup as boolean,
      format: formatBool,
      onchange: (b: boolean) => {
        settings.keepStartup = b;
        save();
      },
    },
  });
}) satisfies SettingsFunc
