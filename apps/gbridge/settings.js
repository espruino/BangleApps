(function(back) {
  function gb(j) {
    Bluetooth.println(JSON.stringify(j));
  }
  function settings() {
    let settings = require('Storage').readJSON("gbridge.json", true) || {};
    if (!("showIcon" in settings)) {
      settings.showIcon = true;
    }
    return settings
  }
  function updateSetting(setting, value) {
    let settings = require('Storage').readJSON("gbridge.json", true) || {};
    settings[setting] = value
    require('Storage').writeJSON('gbridge.json', settings);
  }
  function setIcon(visible) {
    updateSetting('showIcon', visible);
    // need to re-layout widgets
    WIDGETS["gbridgew"].reload();
    g.clear();
    Bangle.drawWidgets();
  }
  var mainmenu = {
    "" : { "title" : "Gadgetbridge" },
    "< Back" : back,
    /*LANG*/"Connected" : { value : NRF.getSecurityStatus().connected?/*LANG*/"Yes":/*LANG*/"No" },
    /*LANG*/"Show Icon" : {
      value: settings().showIcon,
      onchange: setIcon
    },
    /*LANG*/"Find Phone" : function() { E.showMenu(findPhone); },
    /*LANG*/"Record HRM" : {
      value: !!settings().hrm,
      onchange: v => updateSetting('hrm', v)
    }
  };

  var findPhone = {
    "" : { "title" : "-- Find Phone --" },
    /*LANG*/"On" : _=>gb({t:"findPhone",n:true}),
    /*LANG*/"Off" : _=>gb({t:"findPhone",n:false}),
    "< Back" : function() { E.showMenu(mainmenu); },
  };

  E.showMenu(mainmenu);
})
