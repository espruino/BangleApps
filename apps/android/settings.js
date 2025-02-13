(function(back) {
  function gbSend(j) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(j));
  }
  var settings = require("Storage").readJSON("android.settings.json",1)||{};
  function updateSettings() {
    require("Storage").writeJSON("android.settings.json", settings);
  }
  var mainmenu = {
    "" : { "title" : "Android" },
    "< Back" : back,
    /*LANG*/"Connected" : { value : NRF.getSecurityStatus().connected?/*LANG*/"Yes":/*LANG*/"No" },
    /*LANG*/"Find Phone" : () => E.showMenu({
        "" : { "title" : /*LANG*/"Find Phone" },
        "< Back" : ()=>E.showMenu(mainmenu),
        /*LANG*/"On" : _=>gbSend({t:"findPhone",n:true}),
        /*LANG*/"Off" : _=>gbSend({t:"findPhone",n:false}),
      }),
    /*LANG*/"Keep Msgs" : {
      value : !!settings.keep,
      onchange: v => {
        settings.keep = v;
        updateSettings();
      }
    },
    /*LANG*/"Overwrite GPS" : {
      value : !!settings.overwriteGps,
      onchange: newValue => {
        if (newValue) {
          Bangle.setGPSPower(false, 'android');
        }
        settings.overwriteGps = newValue;
        updateSettings();
      }
    },
    /*LANG*/"Messages" : ()=>require("messages").openGUI(),
  };
  E.showMenu(mainmenu);
})
