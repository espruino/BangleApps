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


  const appMenu = {
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
  E.showMenu(appMenu)
})
