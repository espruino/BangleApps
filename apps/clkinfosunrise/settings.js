(function(back) {
  const FILE = "clkinfosunrise.settings.json";
  // Load settings
  var settings = Object.assign({
    followSunPhase: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }


  // Show the menu
  E.showMenu({
    "" : { "title" : "Sunrise Clock Info" },
    "< Back" : () => back(),
    'Follow Sun Phase': {
      value: !!settings.followSunPhase,  // !! converts undefined to false
      onchange: v => {
        settings.followSunPhase = v;
        writeSettings();
      }
    }
  });
})
