(function(back) {
  var FILE = "ffcniftya.json";
  // Load settings
  var cfg = require('Storage').readJSON(FILE, 1) || { showWeekNum: true };

  function writeSettings() {
    require('Storage').writeJSON(FILE, cfg);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Nifty-A Clock" },
    "< Back" : () => back(),
    'week number?': {
      value: cfg.showWeekNum,
      format: v => v?"On":"Off",
      onchange: v => {
        cfg.showWeekNum = v;
        writeSettings();
      }
    }
  });
})