const enum StopWatchFormat {
  HMS,
  Colon,
}
type StopWatchSettings = {
  format: StopWatchFormat,
};

((back: () => void) => {
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
      format: () => settings.format == StopWatchFormat.HMS ? "12h34m56s" : "12:34:56",
      onchange: () => {
        settings.format = (settings.format + 1) % 2;
        save();
      },
    },
  });
})
