(function(back) {
    var FILE = "cassioWatch.settings.json";
    var settings = Object.assign({
      rocketSpeed: 700,
    }, require('Storage').readJSON(FILE, true) || {});
  
    function writeSettings() {
      require('Storage').writeJSON(FILE, settings);
    }
  

    E.showMenu({
      "" : { "title" : "Cassio Watch" },
      "< Back" : () => back(),
      'Rocket Speed': {
        value: 0|settings.rocketSpeed,
        min: 100, max: 60000,
        onchange: v => {
          settings.rocketSpeed = v;
          writeSettings();
        }
      },
    });
  })