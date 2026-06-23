(function(back) {
  const FILE = "bluewatch.settings.json";
  // Load settings
  var settings = Object.assign({
    weatherLocTimeout: 10, // in ms (10 minutes)
    overrideGPS: true,

    
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "BlueWatch" },
    "< Back" : () => back(),
    'Overwrite GPS': {
      value: !!settings.overrideGPS,
      onchange: v => {
        settings.overrideGPS = v;
        writeSettings();
      }
   
    },
    'Weather/Loc interval': {
      value: settings.weatherLocTimeout||10,  // BlueWatch rate-limits weather calls to 10 minutes
      min: 10, max: 120,
      format: v=>{
        return v+" min"
      },
      onchange: v => {
        settings.weatherLocTimeout = v;
        writeSettings();
      }
    },
    
  });
})