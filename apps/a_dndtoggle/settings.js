(function(back) {

    const settings = Object.assign(
        require('Storage').readJSON("a_dndtoggle.default.json", true) || {},
        require('Storage').readJSON("a_dndtoggle.settings.json", true) || {}
      );
  
    function updateSettings() {
      require('Storage').writeJSON("a_dndtoggle.settings.json", settings);
    }

    function buildMainMenu(){
      const modes = [/*LANG*/"Noisy",/*LANG*/"Alarms",/*LANG*/"Silent"];
      let mainmenu = {
        '': { 'title': 'A_DND Toggle' },
        '< Back': back,
        /*LANG*/"Quiet Mode": {
          value: settings.mode,
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
  