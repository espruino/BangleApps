(function(back) {
  var FILE = "binaryclk.json";
  var settings = Object.assign({
    fullscreen: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "Bin Clock" },
    "< Back" : () => back(),
    'Fullscreen': {
      value: settings.fullscreen,
      onchange: v => {
        settings.fullscreen = v;
        writeSettings();
      }
    },
  });
})
