(function(back) {
  function gb(j) {
    Bluetooth.println(JSON.stringify(j));
  }
  var mainmenu = {
    "" : { "title" : "Android" },
    "< Back" : back,
    "Connected" : { value : NRF.getSecurityStatus().connected?"Yes":"No" },
    "Find Phone" : () => E.showMenu({
        "" : { "title" : "Find Phone" },
        "< Back" : ()=>E.showMenu(mainmenu),
        "On" : _=>gb({t:"findPhone",n:true}),
        "Off" : _=>gb({t:"findPhone",n:false}),
      }),
    "Messages" : ()=>load("messages.app.js")
  };
  E.showMenu(mainmenu);
})
