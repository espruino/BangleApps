(function(back) {
  const file = "multitimer.json";
  let json = require('Storage').readJSON(file, true) || {};
  if (Array.isArray(json)) {
    // old format, convert
    json = { sw: json };
  }
  if (!json.sw) json.sw = [];

  function writeSettings() {
    require('Storage').writeJSON(file, json);
  }

  const screens = ["Timers", "Chronos", "Alarms"];

  E.showMenu({
    "": {
      "title": "multitimer"
    },
    "< Back": back,
    "Initial screen": {
      value: json.initialScreen || 0,
      min: 0,
      max: screens.length - 1,
      format: v => screens[v],
      onchange: v => {
        json.initialScreen = v;
        writeSettings();
      }
    },
  });
})
