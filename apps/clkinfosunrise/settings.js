(function(back) {
  const FILE = "clkinfosunrise.settings.json";
  // Load settings
  var settings = Object.assign({
    auto: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }


  // Show the menu
  E.showMenu({
    "" : { "title" : "Sunrise Clock Info" },
    "< Back" : () => back(),
    'Auto Rise & Set': {
      value: !!settings.auto,  // !! converts undefined to false
      onchange: v => {
        settings.auto = v;
        writeSettings();
      }
    }
  });
})
