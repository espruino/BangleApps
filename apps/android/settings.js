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
    /*LANG*/"Find Phone" : () => E.showMenu({
        "" : { "title" : /*LANG*/"Find Phone" },
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
    /*LANG*/"Messages" : ()=>load("messages.app.js"),
    /*LANG*/"Alarms" : () => E.showMenu({
      "" : { "title" : /*LANG*/"Alarms" },
      "< Back" : ()=>E.showMenu(mainmenu),
      /*LANG*/"Vibrate": require("buzz_menu").pattern(settings.vibrate, v => {settings.vibrate = v; updateSettings();}),
      /*LANG*/"Repeat": {
        value: settings.rp,
        format : v=>v?/*LANG*/"Yes":/*LANG*/"No",
        onchange: v => {
          settings.rp = v;
          updateSettings();
        }
      },
      /*LANG*/"Auto snooze": {
        value: settings.as,
        format : v=>v?/*LANG*/"Yes":/*LANG*/"No",
        onchange: v => {
          settings.as = v;
          updateSettings();
        }
      },
    })
  };
  E.showMenu(mainmenu);
})
