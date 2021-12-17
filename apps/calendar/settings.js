(function (back) {
  var FILE = "calendar.json";
  var settings = require('Storage').readJSON(FILE, true) || {};
  if (settings.startOnSun === undefined)
    settings.startOnSun = false;
  if (settings.ndColors === undefined)
    if (process.env.HWVERSION == 2) {
      settings.ndColors = true;
    } else {
      settings.ndColors = false;
    }

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "": { "title": "Calendar" },
    "< Back": () => back(),
    'Start Sunday': {
      value: settings.startOnSun,
      format: v => v ? "Yes" : "No",
      onchange: v => {
        settings.startOnSun = v;
        writeSettings();
      }
    },
    'B2 Colors': {
      value: settings.ndColors,
      format: v => v ? "Yes" : "No",
      onchange: v => {
        settings.ndColors = v;
        writeSettings();
      }
    },
  });
})

