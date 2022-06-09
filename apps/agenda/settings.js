(function(back) {
  function gbSend(message) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(message));
  }
  var CALENDAR = require("Storage").readJSON("android.calendar.json",true)||[];
  var mainmenu = {
    "" : { "title" : "Agenda" },
    "< Back" : back,
    /*LANG*/"Connected" : { value : NRF.getSecurityStatus().connected?/*LANG*/"Yes":/*LANG*/"No" },
    /*LANG*/"Force calendar sync" : () => {
      if(NRF.getSecurityStatus().connected) {
        E.showPrompt(/*LANG*/"Do you want to also clear the internal database first?", {
            buttons: {/*LANG*/"Yes": 1, /*LANG*/"No": 2, /*LANG*/"Cancel": 3}
        }).then((v)=>{
            switch(v) {
                case 1:
                    require("Storage").writeJSON("android.calendar.json",[]);
                    CALENDAR = [];
                    /* falls through */
                case 2:
                    gbSend({t:"force_calendar_sync", ids: CALENDAR.map(e=>e.id)});
                    E.showAlert(/*LANG*/"Request sent to the phone").then(()=>E.showMenu(mainmenu));
                    break;
                case 3:
                default:
                    E.showMenu(mainmenu);
                    return;
            }
        });
      } else {
        E.showAlert(/*LANG*/"You are not connected").then(()=>E.showMenu(mainmenu));
      }
    },
  };
  E.showMenu(mainmenu);
})
