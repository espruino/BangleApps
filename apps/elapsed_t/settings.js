(function(back) {
    var APP_NAME = "elapsed_t";
    var FILE = APP_NAME + ".settings.json";
    // Load settings
    var settings = Object.assign({
        // default values
        displaySeconds: true,
        displayMonthsYears: true,
        dateFormat: 0,
        time24: true
      }, require('Storage').readJSON(APP_NAME + ".settings.json", true) || {});
  
    function writeSettings() {
      require('Storage').writeJSON(FILE, settings);
    }

    var dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
  
    // Show the menu
    E.showMenu({
      "" : { "title" : "Elapsed Time" },
      "< Back" : () => back(),
      'Show\nseconds': {
        value: !!settings.displaySeconds,
        onchange: v => {
          settings.displaySeconds = v;
          writeSettings();
        }
      },
      'Show months/\nyears': {
        value: !!settings.displayMonthsYears,
        onchange: v => {
          settings.displayMonthsYears = v;
          writeSettings();
        }
      },
      'Time format': {
        value: !!settings.time24,
        onchange: v => {
          settings.time24 = v;
          writeSettings();
        },
        format: function (v) {return v ? "24h" : "AM/PM";}
      },
      'Date format': {
        value: settings.dateFormat,
        min: 0, max: 2, wrap: true,
        onchange: v => {
          settings.dateFormat = v;
          writeSettings();
        },
        format: function (v) {return dateFormats[v];}
      }
    });
})
