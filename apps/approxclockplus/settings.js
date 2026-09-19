(function(back) {
  const Storage = require("Storage");

  let settings = Storage.readJSON("approxclockplus.json", 1) || {};

  if (typeof settings.level !== "number") {
    settings.level = 2;
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

    "Detail Level": {
      value: settings.level,
      min: 0,
      max: 3,
      step: 1,
      format: v => {
        return [
          "0 - Day",
          "1 - Broad",
          "2 - Quarter Hour",
          "3 - Exact"
        ][v];
      },
      onchange: v => save("level", v)
    }
  };

  E.showMenu(menu);
})
