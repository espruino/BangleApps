(function (back) {
  var FILE = "calendar.json";
  var settings = require('Storage').readJSON(FILE, true) || {};
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
    'B2 Colors': {
      value: settings.ndColors,
      onchange: v => {
        settings.ndColors = v;
        writeSettings();
      }
    },
  });
})

