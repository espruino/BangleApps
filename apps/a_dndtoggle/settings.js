(function(back) {

    const settings = 
        require('Storage').readJSON("a_dndtoggle.settings.json", true) || {};
  
    function updateSettings() {
      require('Storage').writeJSON("a_dndtoggle.settings.json", settings);
    }

    function buildMainMenu(){
      // 0-Noisy is only a placeholder so that the other values map to the Bangle quiet mode options
      const modes = [/*LANG*/"Noisy",/*LANG*/"Alarms",/*LANG*/"Silent"];
      let mainmenu = {
        '': { 'title': 'A_DND Toggle' },
        '< Back': back,
        /*LANG*/"Quiet Mode": {
          value: settings.mode || 2,
          min: 1, // don't allow choosing 0-Noisy
          max: modes.length - 1,
          format: v => modes[v],
          onchange: v => {
            settings.mode = v;
            updateSettings();
          }
        }
      };

      return mainmenu;
    }
  
    E.showMenu(buildMainMenu());
  })
