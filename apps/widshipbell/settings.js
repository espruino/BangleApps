(function(back) {
  var FILE = "widshipbell.json";
  // Load settings
  var settings = Object.assign({
    strength: 1,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Ship's bell" },
    "< Back" : () => back(),
    'Strength': {
      value: settings.strength,
      min: 0, max: 2,
      format: v => ["Off", "Weak", "Strong"][v],
      onchange: v => {
        settings.strength = v;
        writeSettings();
      }
    },
  });
})
