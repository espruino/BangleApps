(function(back) {
  function gb(j) {
    Bluetooth.println(JSON.stringify(j));
  }
  var settings = require("Storage").readJSON("android.settings.json",1)||{};
  function updateSettings() {
    require("Storage").writeJSON("android.settings.json", settings);
  }
  var mainmenu = {
    "" : { "title" : "Android" },
    "< Back" : back,
    /*LANG*/"Connected" : { value : NRF.getSecurityStatus().connected?"Yes":"No" },
    "Find Phone" : () => E.showMenu({
        "" : { "title" : "Find Phone" },
        "< Back" : ()=>E.showMenu(mainmenu),
        /*LANG*/"On" : _=>gb({t:"findPhone",n:true}),
        /*LANG*/"Off" : _=>gb({t:"findPhone",n:false}),
      }),
    /*LANG*/"Keep Msgs" : {
      value : !!settings.keep,
      format : v=>v?/*LANG*/"Yes":/*LANG*/"No",
      onchange: v => {
        settings.keep = v;
        updateSettings();
      }
    },
    /*LANG*/"Messages" : ()=>load("messages.app.js")
  };
  E.showMenu(mainmenu);
})
