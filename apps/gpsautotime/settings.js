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
    'Show widget?': {
      value: !!settings.show,  // !! converts undefined to false
      format: v => v?"Show":"Hide",
      onchange: v => {
        settings.show = v;
        writeSettings();
      }
    },
  });
})
