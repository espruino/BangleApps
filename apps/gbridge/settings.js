(function(back) {
  function gb(j) {
    Bluetooth.println(JSON.stringify(j));
  }
  const storage = require('Storage');
  let settings = storage.readJSON("gbridge.json", true) || {};
  if (!("showIcon" in settings)) {
    settings.showIcon = true;
  }
  function updateSettings() {
    storage.write('gbridge.json', settings);
  }
  function toggleIcon() {
    settings.showIcon = !settings.showIcon;
    updateSettings();
    Bangle.loadWidgets();
    Bangle.drawWidgets();
  }
  var mainmenu = {
    "" : { "title" : "Gadgetbridge" },
    "Connected" : { value : NRF.getSecurityStatus().connected?"Yes":"No" },
    "Show Icon" : {
      value: settings.showIcon,
      format: v => v?"Yes":"No",
      onchange: toggleIcon
    },
    "Find Phone" : function() { E.showMenu(findPhone); },
    "< Back" : back,
  };

  var findPhone = {
    "" : { "title" : "-- Find Phone --" },
    "On" : _=>gb({t:"findPhone",n:true}),
    "Off" : _=>gb({t:"findPhone",n:false}),
    "< Back" : function() { E.showMenu(mainmenu); },
  };

  E.showMenu(mainmenu);
})
