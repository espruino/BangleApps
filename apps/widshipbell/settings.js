(function(back) {
  var FILE = "widshipbell.json";
  // Load settings
  var settings = Object.assign({
    enabled: true,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Ship's bell" },
    "< Back" : () => back(),
    'Enable?': {
      value: !!settings.enabled,  // !! converts undefined to false
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.enabled = v;
        writeSettings();
      }
    },
  });
})

