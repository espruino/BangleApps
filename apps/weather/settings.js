(function (back) {
  const storage = require("Storage");
  let settings = storage.readJSON("weatherSetting.json", 1);

  // Handle transition from old weather.json to new weatherSetting.json
  if (settings == null) {
    const settingsOld = storage.readJSON("weather.json", 1) || {};
    settings = {
      expiry: "expiry" in settingsOld ? settingsOld.expiry : 2 * 3600000,
      hide: "hide" in settingsOld ? settingsOld.hide : false,
    };
    if (settingsOld != null && settingsOld.weather != null && settingsOld.weather.time != null) {
      settings.time = settingsOld.weather.time;
    }
  }

  function save(key, value) {
    settings[key] = value;
    storage.write("weatherSetting.json", settings);
  }

  const DATA_TYPE = ["basic", "extended", "forecast"];

  let menuItems = {
    "": { "title": "Weather" },
    "Expiry": {
      value: "expiry" in settings ? settings.expiry : 2 * 3600000,
      min: 0,
      max: 24 * 3600000,
      step: 15 * 60000,
      format: (x) => {
        if (x === 0) return "none";
        if (x < 3600000) return `${Math.floor(x / 60000)}m`;
        if (x < 86400000) return `${Math.floor(x / 36000) / 100}h`;
      },
      onchange: (x) => save("expiry", x),
    },
    "Hide Widget": {
      value: "hide" in settings ? settings.hide : false,
      onchange: () => {
        settings.hide = !settings.hide;
        save("hide", settings.hide);
      },
    },
    "< Back": back,
  };

  // Add android only settings
  let android = false;
  try {
    if (require("android") != null) {
      android = true;
    }
  } catch (_) {}

  if (android) {
    menuItems["Refresh Rate"] = {
      value: "refresh" in settings ? settings.refresh : 0,
      min: 0,
      max: 24 * 3600000,
      step: 15 * 60000,
      format: (x) => {
        if (x === 0) return "never";
        if (x < 3600000) return `${Math.floor(x / 60000)}m`;
        if (x < 86400000) return `${Math.floor(x / 36000) / 100}h`;
      },
      onchange: (x) => save("refresh", x),
    };

    menuItems["Data type"] = {
      value: DATA_TYPE.indexOf(settings.dataType ?? "basic"),
      format: (v) => DATA_TYPE[v],
      min: 0,
      max: DATA_TYPE.length - 1,
      onchange: (v) => {
        settings.dataType = DATA_TYPE[v];
        save("dataType", settings.dataType);
      },
    };

    menuItems["Force refresh"] = () => {
      require("weather").updateWeather(true);
    };
  }

  E.showMenu(menuItems);
})
