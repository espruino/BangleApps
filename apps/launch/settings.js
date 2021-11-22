// make sure to enclose the function in parentheses
(function(back) {
  let settings = require('Storage').readJSON('launch.json',1)||{};
  function save(key, value) {
    settings[key] = value;
    require('Storage').write('launch.json',settings);
  }
  const appMenu = {
    '': {'title': 'Launcher Settings'},
    '< Back': back,
    'Scale Value': {
      value: settings.scaleval,
      min:0.1,max:2,step:0.05,wrap:true,
      onchange: (m) => {save('scaleval', m)}
    }   
  };
  E.showMenu(appMenu)
})
