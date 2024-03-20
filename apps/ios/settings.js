(function(back) {
  var settings = require("Storage").readJSON("ios.settings.json",1)||{};
  function updateSettings() {
    require("Storage").writeJSON("ios.settings.json", settings);
  }
  var mainmenu = {
    "" : { "title" : "iOS" },
    "< Back" : back,
    /*LANG*/"Time Sync" : {
      value : !!settings.timeSync,
      onchange: v => {
        settings.timeSync = v;
        updateSettings();
      }
    },
    /*LANG*/"Disable UTF8" : {
      value : !!settings.no_utf8,
      onchange: v => {
        settings.no_utf8 = v;
        updateSettings();
      }
    }
  };
  E.showMenu(mainmenu);
})
