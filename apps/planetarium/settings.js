// make sure to enclose the function in parentheses
(function(back) {
    let settings = require('Storage').readJSON('planetarium.json',1)||{"starnames":false,"constellations":true,"consnames":false};
    function save(key, value) {
      settings[key] = value;
      require('Storage').write('planetarium.json',settings);
    }
    const appMenu = {
      '': {'title': 'Planetarium Settings'},
      '< Back': back,
      'Star names': {
        value: !!settings.starnames,
        onchange: v => {
          save('starnames',v);
        }},
        'Constellations': {
            value: !!settings.constellations,
            onchange: v => {
              save('constellations',v);
            }},
        'Const. names': {
          value: !!settings.consnames,
          onchange: v => {
            save('consnames',v);
          }},
      };
    E.showMenu(appMenu)
  })