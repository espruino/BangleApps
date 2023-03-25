(function(back) {
  function settings() {
    let settings = require('Storage').readJSON("kbtouch.settings.json", true) || {};
    if (settings.textSize===undefined) settings.textSize=1;
    if (settings.offsetKeyboard===undefined) settings.offsetKeyboard=0;
    if (settings.loopAround===undefined) settings.loopAround=1;
    if (settings.oneToOne===undefined) settings.oneToOne=0;
    if (settings.speedScaling===undefined) settings.speedScaling=24;
    return settings;
  }

  function updateSetting(setting, value) {
    let settings = require('Storage').readJSON("kbtouch.settings.json", true) || {};
    settings[setting] = value;
    require('Storage').writeJSON("kbtouch.settings.json", settings);
  }

  var mainmenu = {
    "" : { "title" : /*LANG*/"Touch Keyboard" },
    "< Back" : back,
    /*LANG*/'Text size': {
      value: settings().textSize,
      min: 0, max: 1,
      format: v => [/*LANG*/"Small",/*LANG*/"Big"][v],
      onchange: v => updateSetting("textSize", v)
    },
    /*LANG*/'Offset keyboard': {
      value: !!settings().offsetKeyboard,
      onchange: v => updateSetting("offsetKeyboard", v?1:0)
    },
    /*LANG*/'Loop around': {
      value: !!settings().loopAround,
      onchange: v => updateSetting("loopAround", v?1:0)
    },
    /*LANG*/'One-to-one input and release to select': {
      value: !!settings().oneToOne,
      onchange: v => updateSetting("oneToOne", v?1:0)
    },
    /*LANG*/'Speed scaling': {
      value: settings().speedScaling,
      min: 1, max: 24, step : 1,
      format: v => v,
      onchange: v => updateSetting("speedScaling", v)
    }
    ///*LANG*/'Release to select': {
    //  value: !!(1|settings().fontSize),
    //  onchange: v => updateSetting("releaseToSelect", v?1:0)
    //}
  };
  E.showMenu(mainmenu);
})
