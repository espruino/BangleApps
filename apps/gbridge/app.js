function gb(j) {
  Bluetooth.println(JSON.stringify(j));
}

var mainmenu = {
  "" : { "title" : "Gadgetbridge" },
  "Connected" : { value : NRF.getSecurityStatus().connected?"Yes":"No" },
  "Find Phone" : function() { E.showMenu(findPhone); },
  "Exit" : ()=> {load();},
};

var findPhone = {
  "" : { "title" : "-- Find Phone --" },
  "On" : _=>gb({t:"findPhone",n:true}),
  "Off" : _=>gb({t:"findPhone",n:false}),
  "< Back" : function() { E.showMenu(mainmenu); },
};

E.showMenu(mainmenu);
