(function(back) {
  function settings() {
    let settings = require('Storage').readJSON("messages.settings.json", true) || {};
    if (settings.vibrate===undefined) settings.vibrate=":";
    if (settings.repeat===undefined) settings.repeat=4;
    if (settings.unreadTimeout===undefined) settings.unreadTimeout=60;
    if (settings.maxMessages===undefined) settings.maxMessages=3;
    settings.unlockWatch=!!settings.unlockWatch;
    settings.openMusic=!!settings.openMusic;
    settings.maxUnreadTimeout=240;
    if (settings.flash===undefined) settings.flash=true;
    return settings;
  }
  function updateSetting(setting, value) {
    let settings = require('Storage').readJSON("messages.settings.json", true) || {};
    settings[setting] = value;
    require('Storage').writeJSON("messages.settings.json", settings);
  }

  var mainmenu = {
    "" : { "title" : /*LANG*/"Messages" },
    "< Back" : back,
    /*LANG*/'Vibrate': require("buzz_menu").pattern(settings().vibrate, v => updateSetting("vibrate", v)),
    /*LANG*/'Repeat': {
      value: settings().repeat,
      min: 0, max: 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("repeat", v)
    },
    /*LANG*/'Unread timer': {
      value: settings().unreadTimeout,
      min: 0, max: settings().maxUnreadTimeout, step : 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("unreadTimeout", v)
    },
    /*LANG*/'Min Font': {
      value: 0|settings().fontSize,
      min: 0, max: 1,
      format: v => [/*LANG*/"Small",/*LANG*/"Medium"][v],
      onchange: v => updateSetting("fontSize", v)
    },
    /*LANG*/'Auto-Open Music': {
      value: !!settings().openMusic,
      onchange: v => updateSetting("openMusic", v)
    },
    /*LANG*/'Unlock Watch': {
      value: !!settings().unlockWatch,
      onchange: v => updateSetting("unlockWatch", v)
    },
    /*LANG*/'Flash Icon': {
      value: !!settings().flash,
      onchange: v => updateSetting("flash", v)
    },
    /*LANG*/'Quiet mode disables auto-open': {
      value: !!settings().quietNoAutOpn,
      onchange: v => updateSetting("quietNoAutOpn", v)
    },
    /*LANG*/'Widget messages': {
      value:0|settings().maxMessages,
      min: 1, max: 5,
      onchange: v => updateSetting("maxMessages", v)
    }
  };
  E.showMenu(mainmenu);
})
