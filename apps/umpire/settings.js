(function(back) {
  var FILE = "umpire.json";
  // Load settings
  var settings = Object.assign({
    ballsPerOver: 6,
    oversPerInnings: 40,
    heartRateLimit: 130
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Umpire Ball Counter" },
    "< Back" : () => back(),
    'Balls per over': {
      value: settings.ballsPerOver,
      min: 4, max: 10,
      onchange: v => {
        settings.ballsPerOver = v;
        writeSettings();
      }
    },
    'Overs per inn.': {
      value: settings.oversPerInnings,
      min: 12, max: 50,
      onchange: v => {
        settings.oversPerInnings = v;
        writeSettings();
      }
    },
    'Auto-log HRM': {
      value: settings.heartRateLimit,
      min: 100, max: 200,
      onchange: v => {
        settings.heartRateLimit = v;
        writeSettings();
      }
    }
  });
})
