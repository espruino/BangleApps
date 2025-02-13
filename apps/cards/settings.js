(function(back) {
  var settings = require("Storage").readJSON("cards.settings.json",1)||{};
  function updateSettings() {
    require("Storage").writeJSON("cards.settings.json", settings);
  }
  var mainmenu = {
    "" : { "title" : "Cards" },
    "< Back" : back,
    /*LANG*/"Connected" : { value : NRF.getSecurityStatus().connected?/*LANG*/"Yes":/*LANG*/"No" },
    /*LANG*/"Use 'Today',..." : {
      value : !!settings.useToday,
      onchange: v => {
        settings.useToday = v;
        updateSettings();
      }
    },
    /*LANG*/"Full Brightness" : {
      value : !!settings.fullBrightness,
      onchange: v => {
        settings.fullBrightness = v;
        updateSettings();
      }
    }
  };
  E.showMenu(mainmenu);
})
