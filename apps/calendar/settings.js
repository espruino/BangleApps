(function(back) {
  var FILE = "calendar.json";
  var settings = require('Storage').readJSON(FILE, true) || {};
  if (settings.startOnSun === undefined)
    settings.startOnSun = true;

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "Calendar" },
    "< Back" : () => back(),
    'Start on Sunday': {
      value: settings.startOnSun,
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.startOnSun = v;
        writeSettings();
      }
    },
  });
})

