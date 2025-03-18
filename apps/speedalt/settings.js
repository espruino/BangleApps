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

  function setUnitsDist(d,u) {
    settings.dist = d;
    settings.dist_unit = u;
    writeSettings();
  }

  function setColour(c) {
    settings.colour = c;
    writeSettings();
  }

  
  const appMenu = {
    '': {'title': 'GPS Adv Sprt'},
    '< Back': back,
    '< Load GPS Adv Sport': ()=>{load('speedalt.app.js');},
    'Units' : function() { E.showMenu(unitsMenu); },
    'Colours' : function() { E.showMenu(colMenu); },
    'Kalman Filter' : function() { E.showMenu(kalMenu); }
  };
  
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

  
  E.showMenu(appMenu);

})
