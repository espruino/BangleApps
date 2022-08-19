(function(back) {
  var FILE = "suw.json";
  // Load settings
  var settings = Object.assign({
    nextTideHour: 0,
    nextTideMin: 0,
    nextTideType: "high",
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Seaside Watch" },
    "< Back" : () => back(),
    'Tide type': {
      value: "high"|settings.nextTideType,  // !! converts undefined to false
      format: v => v?"high":"low ",
      onchange: v => {
        settings.nextTideType = v;
        writeSettings();
      }
    },
    'Hour': {
      value: 0|settings.nextTideHour,  // 0| converts undefined to 0
      min: 0, max: 23,
      onchange: v => {
        settings.nextTideHour = v;
        writeSettings();
      }
    },
    'Minutes': {
      value: 0|settings.nextTideMin,  // 0| converts undefined to 0
      min: 0, max: 59,
      onchange: v => {
        settings.nextTideMin = v;
        writeSettings();
      }
    },
  });
});
