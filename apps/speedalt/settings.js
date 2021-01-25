(function(back) {
  let settings = require('Storage').readJSON('speedalt.json',1)||{};
  
  /*
  function save(key, value) {
    settings[key] = value;
    require('Storage').write('settings.json',settings);
  }
  */

  function setUnits(m,u) {
    settings['spd'] = m;
    settings['spd_unit'] = u;
    require('Storage').write('settings.json',settings);
  }

  function setUnitsAlt(m,u) {
    settings['alt'] = m;
    settings['alt_unit'] = u;
    require('Storage').write('settings.json',settings);
  }

  function setTime(b) {
    settings['time'] = b;
    require('Storage').write('settings.json',settings);
  }

  function setDimLevel(b) {
    settings['dim_b'] = b;
    require('Storage').write('settings.json',settings);
  }
  
  function setDimDelay(m) {
    settings['dim_m'] = m;
    require('Storage').write('settings.json',settings);
  }

  const appMenu = {
    '': {'title': 'GPS Speed Alt'},
    '< Back': back,
    "Units" : function() { E.showMenu(unitsMenu); },
    "Power Saving Timeout" : function() { E.showMenu(dimDelayMenu); },
    "Power Saving Brightness" : function() { E.showMenu(dimLevelMenu); }
  };
  
  const unitsMenu = {
    '': {'title': 'Units'},
    '< Back': back,
    'default (spd)' : function() { setUnits(0,''); },
    "Kph (spd)" : function() { setUnits(1,'kph'); },
    "Knots (spd)" : function() { setUnits(1.852,'knots'); },
    "Mph (spd)" : function() { setUnits(1.60934,'mph'); },
    "m/s (spd)" : function() { setUnits(3.6,'m/s'); },
    "Meters (alt)" : function() { setUnitsAlt(1,'m'); },
    "Feet (alt)" : function() { setUnitsAlt(0.3048,'feet'); }
  };

  const dimDelayMenu = {
    '': {'title': 'Reduce Display'},
    '< Back': back,
    'never' : function() { setDimDelay(0); },
    "1 min" : function() { setDimDelay(1); },
    "2 mins" : function() { setDimDelay(2); },
    "5 mins" : function() { setDimDelay(5); },
    "10 mins" : function() { setDimDelay(10); },
    "15 mins" : function() { setDimDelay(15); }
  };

  const dimLevelMenu = {
    '': {'title': 'Display Brightness'},
    '< Back': back,
    '80%' : function() { setDimLevel(0.8); },
    "60%" : function() { setDimLevel(0.6); },
    "40%" : function() { setDimLevel(0.4); },
    "20%" : function() { setDimLevel(0.2); },
    "0%" : function() { setDimLevel(0); }
  };
  
  
  E.showMenu(appMenu)
})
