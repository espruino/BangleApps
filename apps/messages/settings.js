(function(back) {
  const iconColorModes = ['color', 'mono'];

  function loadSettings() {
    let settings = require('Storage').readJSON("messages.settings.json", true) || {};
    if (settings.vibrate===undefined) settings.vibrate="=";
    if (settings.vibrateCalls===undefined) settings.vibrateCalls="=";
    if (settings.repeat===undefined) settings.repeat=4;
    if (settings.repeatCalls===undefined) settings.repeatCalls=settings.repeat;
    if (settings.vibrateTimeout===undefined) settings.vibrateTimeout=60;
    if (settings.unreadTimeout===undefined) settings.unreadTimeout=60;
    if (settings.maxMessages===undefined) settings.maxMessages=3;
    if (settings.iconColorMode === undefined) settings.iconColorMode = iconColorModes[0];
    if (settings.ignoreUnread === undefined) settings.ignoreUnread = 0;
    settings.unlockWatch=!!settings.unlockWatch;
    settings.openMusic=!!settings.openMusic;
    settings.maxUnreadTimeout=240;
    if (settings.flash===undefined) settings.flash=true;
    return settings;
  }
  function updateSetting(setting, value) {
    settings[setting] = value;
    require('Storage').writeJSON("messages.settings.json", settings);
  }
  var settings = loadSettings();

  var mainmenu = {
    "" : { "title" : /*LANG*/"Messages" },
    "< Back" : back,
    /*LANG*/'Vibrate': require("buzz_menu").pattern(settings.vibrate, v => updateSetting("vibrate", v)),
    /*LANG*/'Vibrate for calls': require("buzz_menu").pattern(settings.vibrateCalls, v => updateSetting("vibrateCalls", v)),
    /*LANG*/'Repeat': {
      value: settings.repeat,
      min: 0, max: 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("repeat", v)
    },
    /*LANG*/'Repeat for calls': {
      value: settings.repeatCalls,
      min: 0, max: 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("repeatCalls", v)
    },
    /*LANG*/'Vibrate timer': {
      value: settings.vibrateTimeout,
      min: 0, max: settings.maxUnreadTimeout, step : 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("vibrateTimeout", v)
    },
    /*LANG*/'Unread timer': {
      value: settings.unreadTimeout,
      min: 0, max: settings.maxUnreadTimeout, step : 10,
      format: v => v?v+"s":/*LANG*/"Off",
      onchange: v => updateSetting("unreadTimeout", v)
    },
    /*LANG*/'Min Font': {
      value: 0|settings.fontSize,
      min: 0, max: 1,
      format: v => [/*LANG*/"Small",/*LANG*/"Medium"][v],
      onchange: v => updateSetting("fontSize", v)
    },
    /*LANG*/'Auto-Open Unread Msg': {
      value: !settings.ignoreUnread,
      onchange: v => updateSetting("ignoreUnread", !v)
    },
    /*LANG*/'Auto-Open Music': {
      value: !!settings.openMusic,
      onchange: v => updateSetting("openMusic", v)
    },
    /*LANG*/'Unlock Watch': {
      value: !!settings.unlockWatch,
      onchange: v => updateSetting("unlockWatch", v)
    },
    /*LANG*/'Flash Icon': {
      value: !!settings.flash,
      onchange: v => updateSetting("flash", v)
    },
    /*LANG*/'Quiet mode disables auto-open': {
      value: !!settings.quietNoAutOpn,
      onchange: v => updateSetting("quietNoAutOpn", v)
    },
    /*LANG*/'Disable auto-open': {
      value: !!settings.noAutOpn,
      onchange: v => updateSetting("noAutOpn", v)
    },
    /*LANG*/'Widget messages': {
      value:0|settings.maxMessages,
      min: 0, max: 5,
      format: v => v ? v :/*LANG*/"Hide",
      onchange: v => updateSetting("maxMessages", v)
    },
    /*LANG*/'Show Widgets': {
      value: !!settings.showWidgets,
      onchange: v => updateSetting("showWidgets", v)
    },
    /*LANG*/'Icon color mode': {
      value: Math.max(0,iconColorModes.indexOf(settings.iconColorMode)),
      min: 0, max: iconColorModes.length - 1,
      format: v => iconColorModes[v],
      onchange: v => updateSetting("iconColorMode", iconColorModes[v])
    },
    /*LANG*/'Car driver pos': { // used by messagegui
      value:!!settings.carIsRHD,
      format: v => v ? /*LANG*/"Right" :/*LANG*/"Left",
      onchange: v => updateSetting("carIsRHD", v)
    },
  };
  E.showMenu(mainmenu);
})
