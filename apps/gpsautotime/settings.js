(function(back) {
  var FILE = "gpsautotime.json";
  // Load settings
  var settings = Object.assign({
    show: true,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "GPS auto time" },
    "< Back" : () => back(),
    'Show Widget': {
      value: !!settings.show,
      onchange: v => {
        settings.show = v;
        writeSettings();
      }
    },
  });
})
