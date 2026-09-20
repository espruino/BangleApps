(function(back) {
  const Storage = require("Storage");

  let settings = Storage.readJSON("approxclockplus.json", 1) || {};

  if (typeof settings.level !== "number") {
    settings.level = 2;
  }

  if (typeof settings.theme !== "number") {
    settings.theme = 0;
  }

  function save(key, value) {
    settings[key] = value;
    Storage.write("approxclockplus.json", settings);
  }

  const menu = {
    "": {
      "title": "Approx Clock +"
    },

    "< Back": back,

    "Level": {
      value: settings.level,
      min: 0,
      max: 3,
      step: 1,
      format: v => {
        return [
          "0 - Broad",
          "1 - Loose",
          "2 - Close",
          "3 - Exact"
        ][v];
      },
      onchange: v => save("level", v)
    },

    "Theme": {
      value: settings.theme,
      min: 0,
      max: 2,
      step: 1,
      format: v => {
        return [
          "System",
          "Dark",
          "Light"
        ][v];
      },
      onchange: v => save("theme", v)
    }
  };

  E.showMenu(menu);
})