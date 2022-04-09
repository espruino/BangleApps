(function(back) {
  var settings = require("Storage").readJSON("gbalarms.json", 1) || {};
  E.showMenu({
    "" : { "title": "GB Alarms" },
    "Vibrate": () => require("buzz_menu").pattern(settings.vibrate, v => settings.vibrate=v),
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
  });
});
