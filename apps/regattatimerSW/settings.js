(function(back) {
  var
    file = "regattatimerSW.json",
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
   function setUnits(m,u) {
    settings.spd = m;
    settings.spd_unit = u;
    writeSettings();
  }

  function setUnitsAlt(m,u) {
    settings.alt = m;
    settings.alt_unit = u;
    writeSettings();
  }

  function setUnitsDist(d,u) {
    settings.dist = d;
    settings.dist_unit = u;
    writeSettings();
  }

  function setColour(c) {
    settings.colour = c;
    writeSettings();
  }
  
  const unitsMenu = {
    '': {'title': 'Units'},
    '< Back': function() { E.showMenu(appMenu); },
    'default (spd)' : function() { setUnits(0,''); },
    'km/h (spd)' : function() { setUnits(1,'km/h'); },
    'Knots (spd)' : function() { setUnits(1.852,'kts'); },
    'Mph (spd)' : function() { setUnits(1.60934,'mph'); },
    'm/s (spd)' : function() { setUnits(3.6,'m/s'); },
    'Km (dist)' : function() { setUnitsDist(1000,'km'); },
    'Miles (dist)' : function() { setUnitsDist(1609.344,'mi'); },
    'Nm (dist)' : function() { setUnitsDist(1852.001,'nm'); },
    'Meters (alt)' : function() { setUnitsAlt(1,'meter'); },
    'Feet (alt)' : function() { setUnitsAlt(0.3048,'ft'); }
  };

  const colMenu = {
    '': {'title': 'Colours'},
    '< Back': function() { E.showMenu(appMenu); },
    'Default' : function() { setColour(0); },
    'Hi Contrast' : function() { setColour(1); },
    'Night' : function() { setColour(2); }
  };
  
  const kalMenu = {
    '': {'title': 'Kalman Filter'},
    '< Back': function() { E.showMenu(appMenu); },
    'Speed' : {
    value : settings.spdFilt,
    onchange : () => { settings.spdFilt = !settings.spdFilt; writeSettings(); }
    },
    'Altitude' : {
    value : settings.altFilt,
    onchange : () => { settings.altFilt = !settings.altFilt; writeSettings(); }
    }
  };

  E.showMenu({
    "" : { "title" : "Regatta Timer SW" },
    "< Back" : () => back(),
    'Units' : function() { E.showMenu(unitsMenu); },
    'Colours' : function() { E.showMenu(colMenu); },
    'Kalman Filter' : function() { E.showMenu(kalMenu); },
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
