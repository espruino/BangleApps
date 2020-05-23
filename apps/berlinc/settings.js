(function(back) {
    let settings = require('Storage').readJSON('berlin-clock.json',1)||{};
    function save(key, value) {
      settings[key] = value;
      require('Storage').write('berlin-clock.json',settings);
    }
    const appMenu = {
      '': {'title': 'Berlin Clock Settings'},
      '< Back': back
      /*,
      'Show Date': {
        value: settings.show_date||false,
        format: v => v?'On':'Off',
        onchange: v => {save('showdate', v)}
      }   
      */
    };
    E.showMenu(appMenu)
  })