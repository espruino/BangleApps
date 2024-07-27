(function(back) {
  var FILE = "ashadyclock.json";
  // Load settings
  var settings = Object.assign({
    showWidgets: false,
    alternativeColor: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Shady Clck" },
    "< Back" : () => back(),
    'Show Widgets': {
      value: !!settings.showWidgets,  // !! converts undefined to false
      onchange: v => {
        settings.showWidgets = v;
        writeSettings();
      }
    },
    'Blue Color': {
      value: !!settings.alternativeColor,  // !! converts undefined to false
      onchange: v => {
        settings.alternativeColor = v;
        writeSettings();
      }
    },
  });
})
