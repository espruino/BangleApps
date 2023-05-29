(function(back) {
    function settings() {
      var settings = require('Storage').readJSON("kbmulti.settings.json", true) || {};
      if (settings.showHelpBtn===undefined) { settings.showHelpBtn = true; }
      if (settings.charTimeout===undefined) { settings.charTimeout = 500; }
      if (settings.autoLowercase===undefined) { settings.autoLowercase = true; }
      return settings;
    }
      
    function updateSetting(setting, value) {
      var settings = require('Storage').readJSON("kbmulti.settings.json", true) || {};
      settings[setting] = value;
      require('Storage').writeJSON("kbmulti.settings.json", settings);
    }
    
    var mainmenu = {
      "" : { "title" : /*LANG*/"Multitap keyboard" },
      "< Back" : back,
      /*LANG*/'Character selection timeout [ms]': {
        value: settings().charTimeout,
        min: 200, max: 1500, step : 50,
        format: v => v,
        onchange: v => updateSetting("charTimeout", v),
      },
      /*LANG*/'Lowercase after first uppercase': {
        value: !!settings().autoLowercase,
        onchange: v =>  updateSetting("autoLowercase", v)
      },
      /*LANG*/'Show help button?': {
        value: !!settings().showHelpBtn,
        onchange: v =>  updateSetting("showHelpBtn", v)
      }
    };
    E.showMenu(mainmenu);
  })
