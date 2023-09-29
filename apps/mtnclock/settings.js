(function(back) {
  var STORAGE = require('Storage')

  var FILE = "mtnclock.json";

  // Load settings
  var SETTINGS  = Object.assign({
    // default values
    showWidgets: false,
  }, STORAGE.readJSON(FILE, true) || {});

  function writeSettings() {
    STORAGE.writeJSON(FILE, SETTINGS);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Mountain Clock" },
    "< Back" : () => back(),
    'Show widgets': {
      value: !!SETTINGS.showWidgets,  // !! converts undefined to false
      onchange: value => {
        SETTINGS.showWidgets = value;
        writeSettings();
      }
    },
  });
})
