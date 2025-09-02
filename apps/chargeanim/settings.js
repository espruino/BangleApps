(function(back) {
  var FILE = "chargeAnimSettings.json";
  // Load settings
  
  var settings = Object.assign({
    // default values
    showBatPercent: true,
    showTime: true,
    

  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Charge Animation" },
    "< Back" : () => back(),
    'Show Percent Charged': {
      value: !!settings.showBatPercent,  // !! converts undefined to false
      onchange: v => {
        settings.showBatPercent = v;
        writeSettings();
      }
      // format: ... may be specified as a function which converts the value to a string
      // if the value is a boolean, showMenu() will convert this automatically, which
      // keeps settings menus consistent
    },
    'Show Time': {
      value: !!settings.showTime,  // !! converts undefined to false
      onchange: v => {
        settings.showTime = v;
        writeSettings();
      }
      // format: ... may be specified as a function which converts the value to a string
      // if the value is a boolean, showMenu() will convert this automatically, which
      // keeps settings menus consistent
    }
    
    
  });
})
