(function(back) {
  var FILE = "calibration.json";
  var settings = Object.assign({
    active: true,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "Calibration" },
    "< Back" : () => back(),
    'Active': {
      value: !!settings.active,
      onchange: v => {
        settings.active = v;
        writeSettings();
      }
    },
  });
})