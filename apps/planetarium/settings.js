// make sure to enclose the function in parentheses
(function(back) {
    let settings = require('Storage').readJSON('planetarium.json',1)||{};
    function save(key, value) {
      settings[key] = value;
      require('Storage').write('planetarium.json',settings);
    }
    const appMenu = {
      '': {'title': 'Planetarium Settings'},
      '< Back': back,
      'Star names': {
        value: !!settings.starnames,
        format: v =>v?'On':'Off',
        onchange: v => {
          save('starnames',v);
        }},
        'Constellations': {
            value: !!settings.constellations,
            format: v =>v?'On':'Off',
            onchange: v => {
              save('constellations',v);
            }
      }};
    E.showMenu(appMenu)
  })