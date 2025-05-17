(back) => {
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

  E.showMenu({
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
    "Refresh Rate": {
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
    },
    Forecast: {
      value: "forecast" in settings ? settings.forecast : false,
      onchange: () => {
        settings.forecast = !settings.forecast;
        save("forecast", settings.forecast);
      },
    },
    "Hide Widget": {
      value: "hide" in settings ? settings.hide : false,
      onchange: () => {
        settings.hide = !settings.hide;
        save("hide", settings.hide);
      },
    },
    "Force refresh": () => {
      require("weather").updateWeather(true);
    },
    "< Back": back,
  });
};
