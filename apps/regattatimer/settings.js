(function(back) {
  var file = "regattatimer.json";
  // Load settings
  var settings = Object.assign({
    "dial": "numeric",
    "gps": false,
    "compass": false,
    "language": "en",
    "fgColor": "#FFFF00",
    "bgColor": "#000000"
  }, require('Storage').readJSON(file, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(file, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Regatta Timer" },
    "< Back" : () => back(),
    'GPS': {
      value: !!settings.gps,  // !! converts undefined to false
      onchange: v => {
        settings.gps = v;
        writeSettings();
      }
    },
    'COMPASS': {
      value: !!settings.compass,  // 0| converts undefined to 0
      onchange: v => {
        settings.compass = v;
        writeSettings();
      }
    },
    "DIAL": {
      value: settings.dial,
      min: 0,
      max: 1,
      format: v => ["Numeric", "Disc"][v],
      onchange: v => {
        settings.dial = v;
        writeSettings();
      }
    }
  });
})
