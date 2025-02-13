(function (back) {
  let storage = require('Storage');
  let file = "gassist.json";

  // Load and set default settings
  let appSettings = Object.assign({
    enableTap : true
  }, storage.readJSON(file, true) || {});

  // Save settings to storage
  function writeSettings() {
    storage.writeJSON(file, appSettings);
  }

  function showMenu() {
    E.showMenu({
      "": {
        "title": "Google Assist"
      },
      "< Back": () => back(),
      'Front Tap:': {
        value: (appSettings.enableTap === true),
        onchange: v => {
          appSettings.enableTap = v;
          writeSettings();
        }
      },
    });
  }
  // Initially show the menu
  showMenu();
})
