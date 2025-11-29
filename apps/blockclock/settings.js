(function(back) {
  var FILE = "blockclock.json";

  // Load settings
  var settings = Object.assign({
    beginner: false,
    colour: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "Block Clock" },
    "< Back" : () => back(),
    'Beginner mode': {
      value: !!settings.beginner,
      onchange: v => {
        settings.beginner = v;
        writeSettings();
      }
    },
    'Colour mode': {
      value: !!settings.colour,
      onchange: v => {
        settings.colour = v;
        writeSettings();
      }
    },
  });
})
