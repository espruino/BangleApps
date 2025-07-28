(function(back) {
  var FILE = "BackLite.settings.json";

  var settings = require("Storage").readJSON(FILE, 1) || {};
  
  if (!isFinite(settings.brightness)) settings.brightness = 0.3;

  function writeSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "BackLite" },
    "< Back": back, // fallback if run standalone
    "Brightness": {
      value: settings.brightness,
      min: 0.1, max: 1,
      step: 0.1,
      onchange: v => {
        settings.brightness = v;
        writeSettings();
      }
    },
  });
})
