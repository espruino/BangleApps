(function(back) {
  var settings = require("Storage").readJSON("gbalarms.json", 1) || {};
  var pattern = ["Off", ".", "..", "-", "--", "-.-", "---"];

  function showMainMenu() {
    var mainMenu = {
      "" : { "title": "GB Alarms" },
      "Vibrate": {
        value: settings.vibrate,
        onchange: function() { E.showMenu(vibMenu); },
      },
      "Repeat": {
        value: settings.rp,
        format: v => v ? "Yes" : "No",
        onchange: v => settings.rp = v,
      },
      "Auto snooze": {
        value: settings.as,
        format: v => v ? "Yes" : "No",
        onchange: v => settings.as = v,
      },
      "< Back": function() {
        require('Storage').writeJSON("gbalarms.json", settings);
        back();
      }
    };
  E.showMenu(mainMenu);
  }
  var vibMenu = {
    "< Back": function() {
      showMainMenu();
    }
  };
  pattern.forEach((a, idx) => {
    vibMenu[pattern[idx]] = function() {
      settings.vibrate = a;
      showMainMenu();
    };
  });
  showMainMenu();
});
