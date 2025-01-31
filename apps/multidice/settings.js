(function(back) {
  var settings = Object.assign({
    vibrate: true,
    shake: true,
    screen: false,
    shake_timeout: 200,
    shake_duration: 100,
  }, require('Storage').readJSON("multidice.json", true) || {});

  function writeSettings() {
    require('Storage').writeJSON("multidice.json", settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "multi dice roll" },
    "< Back" : () => back(),
    'vibrate on roll?': {
      value: !!settings.vibrate,
      onchange: v => {
        settings.vibrate = v;
        writeSettings();
      }
    },
    'allow shaking?': {
      value: !!settings.shake,
      onchange: v => {
        settings.shake = v;
        writeSettings();
      }
    },
    'screen on to shake?': {
      value: !!settings.screen,
      onchange: v => {
        settings.screen = v;
        writeSettings();
      }
    },
    'shake timeout': {
      value: settings.shake_timeout / 5,
      min: 10, max: 40,
      format: v => v * 5,
      onchange: v => {
        settings.shake_timeout = v * 5;
        writeSettings();
      }
    },
    'shake duration': {
      value: settings.shake_duration / 5,
      min: 10, max: 40,
      format: v => v * 5,
      onchange: v => {
        settings.shake_duration = v * 5;
        writeSettings();
      }
    },
  });
})
