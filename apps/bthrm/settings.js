(function(back) {
  var FILE = "bthrm.json";
  
  var settings = Object.assign({
    enabled: true,
    replace: true,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    '': { 'title': 'Bluetooth HRM' },
    '< Back': back,
    'Use BT HRM': {
      value: !!settings.enabled,
      format: v => settings.enabled ? "On" : "Off",
      onchange: v => {
        settings.enabled = v;
        writeSettings();
      }
    },
    'Use HRM event': {
      value: !!settings.replace,
      format: v => settings.replace ? "On" : "Off",
      onchange: v => {
        settings.replace = v;
        writeSettings();
      }
    }
  });
})
