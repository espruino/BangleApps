(function(back) {

    function getColorScheme()
    {
        let settings = require('Storage').readJSON("hcclock.json", true) || {};
        if (!("scheme" in settings)) {
          settings.scheme = 0;
        }
        return settings.scheme;
    }
    function setColorScheme(value)
    {
        value = value + 1 % 2;
        let settings = require('Storage').readJSON("hcclock.json", true) || {};
        settings.scheme = value? 1 : 0;
        require('Storage').writeJSON('hcclock.json', settings);
    }
    function setIcon(visible) {
      updateSetting('showIcon', visible);

    }
    var mainmenu = {
      "" : { "title" : "Hi-Contrast Clock" },
      "Color Scheme" : {
        value: getColorScheme,
        format: v => v == 0?"White":"Black",
        onchange: setColorScheme
      },
      "< Back" : back,
    };
    E.showMenu(mainmenu);
  })
  