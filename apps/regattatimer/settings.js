(function(back) {
  var
    file = "regattatimer.json",
    storage = require("Storage"),
    /*dials = ["Numeric", "Discs"],*/
    themes = ["Light", "Dark"],
    settings = Object.assign({
      "debug": false,
      "buzzer": true,
      "dial": "Numeric",
      "gps": true,
      "record": false,
      "theme": "Dark",
    }, storage.readJSON(file, true) || {});

  function save(key, value) {
    settings[key] = value;
    storage.writeJSON(file, settings);
  }

  E.showMenu({
    "" : { "title" : "Regatta Timer" },
    "< Back" : () => back(),
    "GPS": {
      value: !!settings.gps,  // !! converts undefined to false
      onchange: v => {
        save("gps", v);
      }
    },
    "THEME": {
      value: themes.indexOf(settings.theme),
      min: 0,
      max: themes.length - 1,
      step: 1,
      wrap: true,
      format: v => themes[v],
      onchange: (d) => {
        save("theme", themes[d]);
      }
    },
    "BUZZER": {
      value: !!settings.buzzer,  // !! converts undefined to false
      onchange: v => {
        save("buzzer", v);
      }
    },
    /*
    "DIAL": {
      value: dials.indexOf(settings.dial),
      min: 0,
      max: dials.length - 1,
      step: 1,
      wrap: true,
      format: v => dials[v],
      onchange: (d) => {
        save("dial", dials[d]);
      }
    },
    "RECORD": {
      value: !!settings.record,  // 0| converts undefined to 0
      onchange: v => {
        settings.record = v;
        save("record", v);
      }
    },
    */
    "DEBUG": {
      value: !!settings.debug,  // 0| converts undefined to 0
      onchange: v => {
        save("debug", v);
      }
    },
  });
})
