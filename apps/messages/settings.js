(function(back) {
  function settings() {
    let settings = require('Storage').readJSON("messages.settings.json", true) || {};
    if (settings.vibrate===undefined) settings.vibrate=".";
    if (settings.repeat===undefined) settings.repeat=4;
    if (settings.unreadTimeout===undefined) settings.unreadTimeout=60;
    settings.max_unread_timer=240;
    settings.no_repeat_value=(settings.max_unread_timer+1)*1000;
    return settings;
  }
  function updateSetting(setting, value) {
    let appsettings = require('Storage').readJSON("messages.settings.json", true) || {};
    if(setting=="repeat" && value===0)
    {
      value=settings().no_repeat_value;
    }
    appsettings[setting] = value;
    require('Storage').writeJSON("messages.settings.json", appsettings);
  }

  var repeatDisplay = settings().repeat;
  if(repeatDisplay==settings().no_repeat_value) repeatDisplay=0;
  var vibPatterns = [/*LANG*/"Off", ".", "-", "--", "-.-", "---"];
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
      value: repeatDisplay,
      min: 0, max: 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("repeat", v)
    },
    /*LANG*/'Unread timer': {
      value: settings().unreadTimeout,
      min: 0, max: settings().max_unread_timer, step : 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("unreadTimeout", v)
    },
  };
  E.showMenu(mainmenu);
})
