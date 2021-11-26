// make sure to enclose the function in parentheses

  let settings = require('Storage').readJSON('launch.json',1)||{};
  let fonts = g.getFonts();
  function save(key, value) {
    settings[key] = value;
    require('Storage').write('launch.json',settings);
  }
  const appMenu = {
    '': {'title': 'Launcher Settings'},
    '< Back': false,
    'Font': {
      value: settings.font || 2,
      min:0, max:fonts.length-1, step:1,wrap:true,
      onchange: (m) => {save('font', fonts[m])},
      format: v => fonts[v]
     },
    'Vector font size': {
      value: settings.vectorsize || 1,
      min:10, max: 20,step:1,wrap:true,
      onchange: (m) => {save('vectorsize', m)}
    }
  };
  E.showMenu(appMenu)
