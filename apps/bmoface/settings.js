(function(back) {
  var FILE = "bmoface.settings.json";

  // Load settings with proper defaults
  var settings = Object.assign({
    character: "BMO",
    tempUnit: "F",
    randomizerInterval: 0 // 0=off, 1=5min, 2=10min, 3=30min
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "BMO Face Settings" },
    "< Back" : back,
    'Character': {
      value: 0 | ["BMO", "Finn", "Jake"].indexOf(settings.character),
      min: 0, max: 2,
      format: v => ["BMO", "Finn", "Jake"][v],
      onchange: v => {
        settings.character = ["BMO", "Finn", "Jake"][v];
        writeSettings();
      }
    },
    'Temperature Unit': {
      value: settings.tempUnit === "F" ? 1 : 0,
      min: 0, max: 1,
      format: v => v ? "Fahrenheit" : "Celsius",
      onchange: v => {
        settings.tempUnit = v ? "F" : "C";
        writeSettings();
      }
    },
    'Character Randomizer': {
      value: settings.randomizerInterval,
      min: 0, max: 4,
      format: v => ["Off", "5 min", "10 min", "30 min", "On Wake"][v],
      onchange: v => {
        settings.randomizerInterval = v;
        writeSettings();
      }
    }
  });
})
