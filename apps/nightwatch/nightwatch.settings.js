(function(back) {
  var FILE = "nightwatch.json";
  // Load settings
  var settings = Object.assign({
    dt: 5,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "nightwatch" },
    "< Back" : () => back(),
    'log freq (min)': {
      value: 0|settings.dt,  // 0| converts undefined to 0
      min: 1, max: 60,
      onchange: v => {
        settings.dt = v;
        writeSettings();
      }
    },
  });
})
