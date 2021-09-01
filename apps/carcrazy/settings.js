// make sure to enclose the function in parentheses
(function(back) {
  let settings = require('Storage').readJSON('app.json',1)||{};
  function save(key, value) {
    settings[key] = value;
    require('Storage').write('app.json',settings);
  }
  const appMenu = {
    '': {'title': 'App Settings'},
    '< Back': back,
    'High Score Reset': {
      value: settings.monkeys||12,
      onchange: (m) => {save('monkeys', m)}
    }   
  };
  E.showMenu(appMenu)
})
