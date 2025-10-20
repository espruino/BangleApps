(function(back) {
  var FILE = "doomguy.settings.json";

  // Load settings with proper defaults
  var settings = Object.assign({
    faceMetric: "battery", // Default to battery
    tempUnit: "F" // Default to Fahrenheit
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  function showSettingsMenu() {
    E.showMenu({
    "" : { "title" : "Doomguy Settings" },
    "< Back" : back,
    'Face Metric': {
      value: ["battery", "heartrate", "temperature", "steps", "hits"].indexOf(settings.faceMetric),
      min: 0, max: 4,
      format: function(v) {
        var options = ["Battery", "Heart Rate", "Temperature", "Steps", "Hit Counter"];
        return options[v];
      },
      onchange: function(v) {
        var options = ["battery", "heartrate", "temperature", "steps", "hits"];
        settings.faceMetric = options[v];
        writeSettings();
      }
    },
    'Temperature Unit': {
      value: settings.tempUnit === "F" ? 1 : 0,
      min: 0, max: 1,
      format: function(v) { return v ? "Fahrenheit" : "Celsius"; },
      onchange: function(v) {
        settings.tempUnit = v ? "F" : "C";
        writeSettings();
      }
    },
    'Reset Hit Counter': {
      value: false,
      onchange: function() {
        // Reset hit counter
        require('Storage').writeJSON("doomguy.hits.json", {
          date: new Date().getFullYear() + "-" + new Date().getMonth() + "-" + new Date().getDate(),
          count: 0
        });
        // Show brief confirmation message
        g.clear();
        g.setFont("6x8", 2);
        g.setColor(0, 1, 0); // Green color
        g.drawString("Hit Counter", 20, 50);
        g.drawString("Reset!", 20, 80);
        g.flip();
        // Auto-return to settings after 1 second
        setTimeout(function() {
          showSettingsMenu();
        }, 1000);
      }
    }
  });
  }

  // Show the menu
  showSettingsMenu();
})(back);
