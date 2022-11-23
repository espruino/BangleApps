//eval(require("Storage").read("messages.settings.js"));
(function(back) {
    const SETTINGS_FILE_NAME="messages_light.settings.json";
    let  settings = function() {
        let settings = require('Storage').readJSON(SETTINGS_FILE_NAME, true) || {};
        settings.openMusic=!!settings.openMusic;
        //settings.unlockWatch=!!settings.unlockWatch;
        return settings;
    }
    function updateSetting(setting, value) {
      let settings = require('Storage').readJSON(SETTINGS_FILE_NAME, true) || {};
      settings[setting] = value;
      require('Storage').writeJSON(SETTINGS_FILE_NAME, settings);
    }
  
    var mainmenu = {
      "" : { "title" : /*LANG*/"Messages Light" },
      "< Back" : back,
      /*LANG*/'Auto-Open Music': {
        value: !!settings().openMusic,
        onchange: v => updateSetting("openMusic", v)
      }
      /*,/LANG/'Unlock Watch': {
        value: !!settings().unlockWatch,
        onchange: v => updateSetting("unlockWatch", v)
      },*/
    };
    E.showMenu(mainmenu);
  });
  