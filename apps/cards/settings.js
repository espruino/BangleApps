(function(back) {
  function gbSend(message) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(message));
  }
  var settings = require("Storage").readJSON("cards.settings.json",1)||{};
  function updateSettings() {
    require("Storage").writeJSON("cards.settings.json", settings);
  }
  var CALENDAR = require("Storage").readJSON("android.calendar.json",true)||[];
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
  };
  E.showMenu(mainmenu);
})
