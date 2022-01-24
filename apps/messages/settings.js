(function(back) {
  function settings() {
    let settings = require('Storage').readJSON("messages.settings.json", true) || {};
    if (settings.vibrate===undefined) settings.vibrate=".";
    if (settings.repeat===undefined) settings.repeat=4;
    if (settings.unreadTimeout===undefined) settings.unreadTimeout=60;
    return settings;
  }
  function updateSetting(setting, value) {
    let settings = require('Storage').readJSON("messages.settings.json", true) || {};
    settings[setting] = value;
    require('Storage').writeJSON("messages.settings.json", settings);
  }

  var vibPatterns = [/*LANG*/"Off", ".", "-", "--", "-.-", "---"];
  var currentVib = settings().vibrate;
  var mainmenu = {
    "" : { "title" : /*LANG*/"Messages" },
    "< Back" : back,
    /*LANG*/'Vibrate': {
      value: Math.max(0,vibPatterns.indexOf(settings().vibrate)),
      min: 0, max: vibPatterns.length,
      format: v => vibPatterns[v]||"Off",
      onchange: v => {
        updateSetting("vibrate", vibPatterns[v]);
      }
    },
    /*LANG*/'Repeat': {
      value: settings().repeat,
      min: 2, max: 10,
      format: v => v+"s",
      onchange: v => updateSetting("repeat", v)
    },
    /*LANG*/'Unread timer': {
      value: settings().unreadTimeout,
      min: 0, max: 240, step : 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("unreadTimeout", v)
    },
  };
  E.showMenu(mainmenu);
})
