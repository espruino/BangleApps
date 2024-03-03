(function(back) {
  var FILE = "waypointer.json";
  // Load settings
  var settings = Object.assign({
    smoothDirection: true,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Way Pointer" },
    "< Back" : () => back(),
    'Smooth arrow rot': {
      value: !!settings.smoothDirection,
      onchange: v => {
        settings.smoothDirection = v;
        writeSettings();
      }
    },
  });
})
