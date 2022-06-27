(function(back) {
  var FILE = "dtlaunch.json";
  
  var settings = Object.assign({
    showClocks: true,
    showLaunchers: true
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "Desktop launcher" },
    "< Back" : () => back(),
    'Show clocks': {
      value: settings.showClocks,
      onchange: v => {
        settings.showClocks = v;
        writeSettings();
      }
    },
    'Show launchers': {
      value: settings.showLaunchers,
      onchange: v => {
        settings.showLaunchers = v;
        writeSettings();
      }
    }
  });
})
