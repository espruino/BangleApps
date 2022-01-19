(function(back) {
  var FILE = "vectorclock.json";
  // Load settings
  var settings = Object.assign({
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  var colnames = ["white", "yellow", "green", "cyan", "red", "orange", "magenta", "black"];
  var colvalues = [0xFFFF, 0xFFE0, 0x07E0, 0x07FF, 0xF800, 0xFD20, 0xF81F, 0x0000];
  // Show the menu
  E.showMenu({
    "" : { "title" : "VectorClock colours" },
    "< Back" : () => back(),
    'Time': {
      value: Math.max(0 | colvalues.indexOf(settings.timecol),0),
      min: 0, max: colvalues.length-1,
      format: v => colnames[v],
      onchange: v => {
        settings.timecol = colvalues[v];
        writeSettings();
      }
    },
    'Weekday': {
      value: Math.max(0 | colvalues.indexOf(settings.dowcol),0),
      min: 0, max: colvalues.length-1,
      format: v => colnames[v],
      onchange: v => {
        settings.dowcol = colvalues[v];
        writeSettings();
      }
    },
    'Date': {
      value: Math.max(0 | colvalues.indexOf(settings.datecol),0),
      min: 0, max: colvalues.length-1,
      format: v => colnames[v],
      onchange: v => {
        settings.datecol = colvalues[v];
        writeSettings();
      }
    },
  });
})
