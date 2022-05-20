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
    'Widgets?': {
      value: !!settings.withWidgets,  // !! converts undefined to false
      format: v => v?"Show":"Hide",
      onchange: v => {
        settings.withWidgets = v;
        writeSettings();
      }
    },
    'Inverted?': {
      value: !!settings.isInvers,  // !! converts undefined to false
      format: v => v?"Yes":"No",
      onchange: v => {
        settings.withWidgets = v;
        writeSettings();
      }
    },
    'On Lock?': {
      value: !!settings.isInvers,  // !! converts undefined to false
      format: v => v?"Play":"Pause",
      onchange: v => {
        settings.withWidgets = v;
        writeSettings();
      }
    }
  });
})/*(load)/**/