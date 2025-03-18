(function(back) {
  var FILE = "hralarm.json";
  
  var settings = Object.assign({
    enabled: false,
    upper: 180,
    warning: 170,
    lower: 150,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    '': { 'title': 'HR Alarm' },
    '< Back': back,
    'Enabled': {
      value: !!settings.enabled,
      onchange: v => {
        settings.enabled = v;
        writeSettings();
      }
    },
    'Upper limit': {
      value: settings.upper,
      min: 0,
      step:5,
      max: 300,
      onchange: v => {
        settings.upper = v;
        writeSettings();
      }
    },
    'Lower limit': {
      value: settings.lower,
      min: 0,
      step:5,
      max: 300,
      onchange: v => {
        settings.lower = v;
        writeSettings();
      }
    },
    'Warning at': {
      value: settings.warning,
      min: 0,
      step:5,
      max: 300,
      onchange: v => {
        settings.warning = v;
        writeSettings();
      }
    }
  });
})
