const enum StopWatchFormat {
  HMS,
  Colon,
}
type StopWatchSettings = {
  format: StopWatchFormat,
};

(back => {
  const SETTINGS_FILE = "clkinfostopw.setting.json";

  const storage = require("Storage");
  const settings: StopWatchSettings = storage.readJSON(SETTINGS_FILE, true) || {};
  settings.format ??= StopWatchFormat.HMS;

  const save = () => {
    storage.writeJSON(SETTINGS_FILE, settings)
  };

  E.showMenu({
    "": { "title": "stopwatch" },
    "< Back": back,
    "Format": {
      value: settings.format,
      min: StopWatchFormat.HMS,
      max: StopWatchFormat.Colon,
      format: v => v === StopWatchFormat.HMS ? "12m34s" : "12:34",
      onchange: v => {
        settings.format = v;
        save();
      },
    },
  });
}) satisfies SettingsFunc
