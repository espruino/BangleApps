(function(back) {
  var FILE = "vpw_clock.settings.json";
  // Load settings
  var settings = Object.assign({
    foregroundColor: 0,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  var foregroundColors = ["Red", "Purple", "White", "Black"];

  // Show the menu
  E.showMenu({
    "" : { "title" : "Vaporwave Sunset" },
    "< Back" : () => back(),
    'Foreground color': {
      value: 0|settings.foregroundColor,  // 0| converts undefined to 0
      min: 0, max: 3,
      onchange: v => {
        settings.foregroundColor = v;
        writeSettings();
      },
      format: function (v) {return foregroundColors[v];}
    },
  });
})