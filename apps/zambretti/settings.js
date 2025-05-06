(function(back) {
  const FILE = "zambretti.json";
  // Load settings
  const settings = Object.assign({
    height: 0,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Zambretti Forecast" },
    "< Back" : () => back(),
    'Height above sea level (m)': {
      value: settings.height,
      min: 0, max: 1000,
      onchange: v => {
        settings.height = v;
        writeSettings();
      }
    },
  });
})
