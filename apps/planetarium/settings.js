// make sure to enclose the function in parentheses
(function(back) {
    let settings = require('Storage').readJSON('planetarium.json',1)||{};
    const appMenu = {
      '': {'title': 'Planetarium Settings'},
      '< Back': back,
      'Star names': {
        value: !settings.starnames,
        format: v => v ? 'Yes' : 'No',
        onchange: v => require('Storage').write('planetarium.json', {starnames: !v}),
      },
      'Constellations': {
        value: !settings.constellations,
        format: v => v ? 'Yes' : 'No',
        onchange: v => require('Storage').write('planetarium.json', {constellations: !v}),
      }   
    };
    E.showMenu(appMenu)
  })