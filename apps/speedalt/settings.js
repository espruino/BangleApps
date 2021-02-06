(function(back) {

  let settings = require('Storage').readJSON('speedalt.json',1)||{};
  //settings.buzz = settings.buzz||1;
  
  function writeSettings() {
    require('Storage').write('speedalt.json',settings);
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

  function setColour(c) {
    settings.colour = c;
    writeSettings();
  }
  
  const appMenu = {
    '': {'title': 'GPS Speed Alt'},
    '< Back': back,
    'Units' : function() { E.showMenu(unitsMenu); },
    'Colours' : function() { E.showMenu(colMenu); },
    'Vibrate' : {
    value : settings.buzz,
    format : v => v?"On":"Off",
    onchange : () => { settings.buzz = !settings.buzz; writeSettings(); }
    }};
  
  const unitsMenu = {
    '': {'title': 'Units'},
    '< Back': function() { E.showMenu(appMenu); },
    'default (spd)' : function() { setUnits(0,''); },
    'Kph (spd)' : function() { setUnits(1,'kph'); },
    'Knots (spd)' : function() { setUnits(1.852,'knots'); },
    'Mph (spd)' : function() { setUnits(1.60934,'mph'); },
    'm/s (spd)' : function() { setUnits(3.6,'m/s'); },
    'Meters (alt)' : function() { setUnitsAlt(1,'m'); },
    'Feet (alt)' : function() { setUnitsAlt(0.3048,'feet'); }
  };

  const colMenu = {
    '': {'title': 'Colours'},
    '< Back': function() { E.showMenu(appMenu); },
    'Default' : function() { setColour(0); },
    'Hi Contrast' : function() { setColour(1); },
    'Night' : function() { setColour(2); }
  };
  
  
  E.showMenu(appMenu);

})
