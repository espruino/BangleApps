(function(back) {
    const VARIANT_EXACT = 'exact';
    const VARIANT_APPROXIMATE = 'approximate';
    const VARIANT_HYBRID = 'hybrid';
  
    const DEFAULTS_FILE = "dutchclock.default.json"; 
    const SETTINGS_FILE = "dutchclock.json";
  
    // Load settings
    const settings = Object.assign(
        storage.readJSON(DEFAULTS_FILE, true)?.settings || {},
        storage.readJSON(SETTINGS_FILE, true) || {}
    );
  
    function writeSettings() {
      require('Storage').writeJSON(SETTINGS_FILE, settings);
    }
  
    function writeSetting(setting, value) {
      settings[setting] = value;
      writeSettings();
    }
  
    function writeOption(setting, value) {
      writeSetting(setting, value);
      showMainMenu();
    }
    
    function getOption(label, setting, value) {
      return {
        title: label,
        value: settings[setting] === value,
        onchange: () => {
          writeOption(setting, value);
        }
      };
    }
  
    // Show the menu
    function showMainMenu() {
      const mainMenu = [
        getOption('Exact', 'variant', VARIANT_EXACT),
        getOption('Approximate', 'variant', VARIANT_APPROXIMATE),
        getOption('Hybrid', 'variant', VARIANT_HYBRID),
        {
          title: 'Show widgets?',
          value: settings.showWidgets ?? true,
          onchange: v => writeSetting('showWidgets', v)
        }
      ];
  
      mainMenu[""] = {
        title : "Dutch Clock",
        back: back
      };
  
      E.showMenu(mainMenu);
    }
    
    showMainMenu();
  })