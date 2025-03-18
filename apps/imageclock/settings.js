(function(back) {
  var FILE = "imageclock.json";
  
  var settings = Object.assign({
    stepsgoal: 10000,
    perflog: false
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    '': { 'title': 'Imageclock' },
    '< Back': back,
    'Steps goal': {
      value: settings.stepsgoal,
      min: 0,
      step: 500,
      max: 50000,
      onchange: v => {
        settings.stepsgoal = v;
        writeSettings();
      }
    },
    'Performance log': {
      value: !!settings.perflog,
      onchange: v => {
        settings.perflog = v;
        writeSettings();
      }
    }
  });
})
