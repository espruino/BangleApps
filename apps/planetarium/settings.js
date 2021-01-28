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
      'Show star names': {
        value: settings.showstarnames||false,
        onchange: (m) => {save('showstarnames', m)}
      },
      'Show constellations': {
        value: settings.showcons||true,
        onchange: (m) => {save('showcons', m)}
      }      
    };
    E.showMenu(appMenu)
  })