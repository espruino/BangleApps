(function(back) {
  var FILE = "BackLite.settings.json";
  // Load settings
  var settings = Object.assign({
      brightness: 0.3,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "BackLite" },
    'Brightness': {
      value: 0.3|settings.brightness,  
      min: 0.1, max: 1,
      step: 0.1,
      onchange: v => {
        settings.brightness = v;
        writeSettings();
      }
    },
  });
})
