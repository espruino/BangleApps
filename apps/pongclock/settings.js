(function(back) {
  var FILE = "pongclock.json";
  // Load settings
  var settings = Object.assign({
    // default values
    withWidgets: true,
    isInvers: false,
    playLocked: true,
    }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Pong Clock" },
    "< Back" : () => back(),
    'Show Widgets': {
      value: !!settings.withWidgets,
      onchange: v => {
        settings.withWidgets = v;
        writeSettings();
      }
    },
    'Inverted?': {
      value: !!settings.isInvers,
      onchange: v => {
        settings.isInvers = v;
        writeSettings();
      }
    },
    'On Lock?': {
      value: !!settings.playLocked,
      format: v => v?"Play":"Pause",
      onchange: v => {
        settings.playLocked = v;
        writeSettings();
      }
    }
  });
})
