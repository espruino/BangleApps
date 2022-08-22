(function(back) {
  var FILE = "suw.json";
  // Load settings
  var settings = Object.assign({
    nextTideType: "high",
    nextTideHour: 0,
    nextTideMin: 0,
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
        print(v);
        writeSettings();
      }
    },
    'Hour': {
      value: 0|settings.nextTideHour,  // 0| converts undefined to 0
      min: 0, max: 23,
      onchange: v => {
        settings.nextTideHour = v;
        print(v);
        writeSettings();
      }
    },
    'Minutes': {
      value: 0|settings.nextTideMin,  // 0| converts undefined to 0
      min: 0, max: 59,
      onchange: v => {
        settings.nextTideMin = v;
        print(v);
        writeSettings();
      }
    },
  });
});
