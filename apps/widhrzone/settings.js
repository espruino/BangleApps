(function(back) {
  const CONFIGFILE = "widhrzone.json";
  // Load settings
  const settings = Object.assign({
    maxHrm: 200,
  }, require("Storage").readJSON(CONFIGFILE,1) || {});

  function writeSettings() {
    require('Storage').writeJSON(CONFIGFILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "HRzone widget" },
    "< Back" : () => back(),
    /*LANG*/'HR max': {
      format: v => v,
      value: settings.maxHrm,
      min: 30, max: 220,
      onchange: v => {
        settings.maxHrm = v;
        writeSettings();
      }
    },
  });
});
