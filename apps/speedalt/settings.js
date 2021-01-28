(function(back) {
  let settings = require('Storage').readJSON('speedalt.json',1)||{};
  
  /*
  function save(key, value) {
    settings[key] = value;
    require('Storage').write('speedalt.json',settings);
  }
  */

  function setUnits(m,u) {
    settings['spd'] = m;
    settings['spd_unit'] = u;
    require('Storage').write('speedalt.json',settings);
  }

  function setUnitsAlt(m,u) {
    settings['alt'] = m;
    settings['alt_unit'] = u;
    require('Storage').write('speedalt.json',settings);
  }

  function setColour(c) {
    settings['colour'] = c;
    require('Storage').write('speedalt.json',settings);
  }
  
  const appMenu = {
    '': {'title': 'GPS Speed Alt'},
    'Units' : function() { E.showMenu(unitsMenu); },
    'Colours' : function() { E.showMenu(colMenu); },
    '< Back': back
  };
  
  const unitsMenu = {
    '': {'title': 'Units'},
    'default (spd)' : function() { setUnits(0,''); },
    'Kph (spd)' : function() { setUnits(1,'kph'); },
    'Knots (spd)' : function() { setUnits(1.852,'knots'); },
    'Mph (spd)' : function() { setUnits(1.60934,'mph'); },
    'm/s (spd)' : function() { setUnits(3.6,'m/s'); },
    'Meters (alt)' : function() { setUnitsAlt(1,'m'); },
    'Feet (alt)' : function() { setUnitsAlt(0.3048,'feet'); },
    '< Back': function() { E.showMenu(appMenu); }
  };

  const colMenu = {
    '': {'title': 'Colours'},
    'Default' : function() { setColour(0); },
    'Hi Contrast' : function() { setColour(1); },
    'Night' : function() { setColour(2); },
    '< Back': function() { E.showMenu(appMenu); }
  };
  
  
  E.showMenu(appMenu)
})
