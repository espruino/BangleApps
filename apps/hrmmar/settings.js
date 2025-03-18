(function(back) {
  var FILE = "hrmmar.json";
  // Load settings
  var settings = Object.assign({
   mAremoval: 1,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "HRM MA removal" },
    "< Back" : () => back(),
    'MA removal': {
      value: settings.mAremoval,
      min: 0, max: 1,
      format: v => ["None", "fft elim."][v],
      onchange: v => {
        settings.mAremoval = v;
        writeSettings();
      }
    },
  });
})
