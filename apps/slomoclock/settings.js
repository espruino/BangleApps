(function(back) {

  let settings = require('Storage').readJSON('slomoclock.json',1)||{};
  
  function writeSettings() {
    require('Storage').write('slomoclock.json',settings);
  }
  
  const appMenu = {
    '': {'title': 'SloMo Clock'},
    '< Back': back,
    'Widget Space Top' : {value : settings.widTop, format : v => v?"On":"Off",onchange : () => { settings.widTop = !settings.widTop; writeSettings(); },
    'Widget Space Bottom' : {value : settings.widBot, format : v => v?"On":"Off",onchange : () => { settings.widBot = !settings.widBot; writeSettings(); }
  };
  
  E.showMenu(appMenu);

});
