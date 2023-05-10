type DrainedSettings = {
  battery?: number,
  restore?: number,
  interval?: number,
  keepStartup?: ShortBoolean,
  exceptions?: string[],
};

(back => {
  const SETTINGS_FILE = "drained.setting.json";

  const storage = require("Storage")
  const settings: DrainedSettings = storage.readJSON(SETTINGS_FILE, true) || {};
  settings.battery ??= 5;
  settings.restore ??= 20;
  settings.interval ??= 10;
  settings.keepStartup ??= true;
  settings.exceptions ??= ["widdst.0"]; // daylight savings

  const save = () => {
    storage.writeJSON(SETTINGS_FILE, settings)
  };

  const menu: Menu = {
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
      onchange: (b: boolean) => {
        settings.keepStartup = b;
        save();
        updateAndRedraw();
      },
    },
  };

  const updateAndRedraw = () => {
    // will change the menu, queue redraw:
    setTimeout(() => { E.showMenu(menu) }, 10);

    if (settings.keepStartup) {
      delete menu["Startup exceptions"];
      return;
    }
    menu["Startup exceptions"] = () => E.showMenu(bootExceptions);

    const bootExceptions: Menu = {
      "": { "title" : "Startup exceptions" },
      "< Back": () => E.showMenu(menu),
    };

    storage.list(/\.boot\.js/)
      .map(name => name.replace(".boot.js", ""))
      .forEach((name: string) => {
        bootExceptions[name] = {
          value: settings.exceptions!.indexOf(name) >= 0,
          onchange: (b: boolean) => {
            if (b) {
              settings.exceptions!.push(name);
            } else {
              const i = settings.exceptions!.indexOf(name);
              if (i >= 0) settings.exceptions!.splice(i, 1);
            }
            save();
          },
        };
      });
  };

  updateAndRedraw();
}) satisfies SettingsFunc
