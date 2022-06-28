(function(back) {

  let settings = require('Storage').readJSON('bikespeedo.json',1)||{};

  function writeSettings() {
    require('Storage').write('bikespeedo.json',settings);
  }

  const appMenu = {
    '': {'title': 'Bike Speedometer'},
    '< Back': back,
    '< Load Bike Speedometer': ()=>{load('bikespeedo.app.js');},
    'Barometer Altitude adjustment' : function() { E.showMenu(altdiffMenu); },
    'Kalman Filters' : function() { E.showMenu(kalMenu); }
  };

  const altdiffMenu = {
    '': { 'title': 'Altitude adjustment' },
    '< Back': function() { E.showMenu(appMenu); },
    'Altitude delta': {
      value: settings.altDiff || 100,
      min: -200,
      max: 200,
      step: 10,
      onchange: v => {
        settings.altDiff = v;
        writeSettings(); }
    }
  };

  const kalMenu = {
    '': {'title': 'Kalman Filters'},
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

});
