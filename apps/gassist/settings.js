let storage = require('Storage');

(function (back) {
  // Load and set default settings
  let appSettings = Object.assign({
    enableTap : true
  }, storage.readJSON("gassist.json", true) || {});

  // Save settings to storage
  function writeSettings() {
    storage.writeJSON("gassist.json", appSettings);
  }

  function showMenu() {
    E.showMenu({
      "": {
        "title": "Google Assist"
      },
      "< Back": () => back(),
      'Front Tap:': {
        value: (appSettings.enableTap === true),
        format: v => v ? "On" : "Off",
        onchange: v => {
          appSettings.enableTap = v;
          writeSettings();
        }
      },
    });
  }
  // Initially show the menu
  showMenu();
});