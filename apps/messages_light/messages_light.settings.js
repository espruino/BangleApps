(function(back) {
    const SETTINGS_FILE_NAME="messages_light.settings.json";
    let  settings = function() {
        let settings = require('Storage').readJSON(SETTINGS_FILE_NAME, true) || {};
        return settings;
    }
    function updateSetting(setting, value) {
      let settings = require('Storage').readJSON(SETTINGS_FILE_NAME, true) || {};
      settings[setting] = value;
      require('Storage').writeJSON(SETTINGS_FILE_NAME, settings);
    }
    const timeOutChoices = [/*LANG*/"Off", "10s", "15s", "20s", "30s"];
    var mainmenu = {
      "" : { "title" : /*LANG*/"Messages Light" },
      "< Back" : back,
      /*LANG*/'Time Out': {
        value: timeOutChoices.indexOf(settings.timeOut),
        min: 0, max: timeOutChoices.length-1,
        format: v => timeOutChoices[v],
        onchange: m => {
          updateSetting("timeOut", timeOutChoices[m]);
        }
      },
    };
    E.showMenu(mainmenu);
  })
