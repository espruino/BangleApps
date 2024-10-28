(function(back) {
  var FILE = "berlinc.json";
  var settings = Object.assign({
    fullscreem: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  var mainmenu = {
    "": {
      "title": "Berlin clock"
    },
    "< Back": () => back(),
    "Fullscreen": {
      value: !!settings.fullscreen,
      onchange: v => {
        settings.fullscreen = v;
        writeSettings();
      }
    }
  };
  E.showMenu(mainmenu);

})
