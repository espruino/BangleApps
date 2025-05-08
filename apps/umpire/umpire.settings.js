(function(back) {
  var FILE = "umpire.json";
  // Load settings
  var settings = Object.assign({
    ballsPerOver: 6,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Umpire Ball Counter" },
    "< Back" : () => back(),
    'Balls per over': {
      value: 6|settings.ballsPerOver,  // 6| converts undefined to 6
      min: 4, max: 10,
      onchange: v => {
        settings.ballsPerOver = v;
        writeSettings();
      }
    },
  });
})
