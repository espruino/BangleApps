(function(back) {

    const settings = 
        require('Storage').readJSON("a_dndtoggle.settings.json", true) || {};
  
    function updateSettings() {
      require('Storage').writeJSON("a_dndtoggle.settings.json", settings);
    }

    function buildMainMenu(){
      const modes = [/*LANG*/"Noisy",/*LANG*/"Alarms",/*LANG*/"Silent"];
      let mainmenu = {
        '': { 'title': 'A_DND Toggle' },
        '< Back': back,
        /*LANG*/"Quiet Mode": {
          value: settings.mode || 2,
          min: 1, max: modes.length - 1,
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
  });
  