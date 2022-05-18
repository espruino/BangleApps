(function(back) {
  var FILE = "widbt.json";
  var settings = require('Storage').readJSON(FILE, true) || {};

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "Bluetooth Widget" },
    "< Back" : () => back(),
    'No conn. widget': {
      value: !!settings.hideDisconnected,
      format: v => v?"Hide":"Show",
      onchange: v => {
        settings.hideDisconnected = v;
        writeSettings();
        if (WIDGETS.bluetooth) WIDGETS.bluetooth.changed();
      }
    },
  });
})
