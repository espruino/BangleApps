(function(){
  if (!sleeplog) return; // sleeplog not installed

  const SETTINGS_FILE = 'widsleepstatus.json';
  let settings;
  function loadSettings() {
    settings = require('Storage').readJSON(SETTINGS_FILE, 1) || {};
    const DEFAULTS = {
      'hidewhenawake': true
    };
    Object.keys(DEFAULTS).forEach(k=>{
      if (settings[k]===undefined) settings[k]=DEFAULTS[k];
    });
  }

  const status = sleeplog.status || 0;
  WIDGETS["sleepstatus"]={area:"tr",width:status >= 2 ? 24 : 0,draw:function(w) {
    g.reset();
    // Icons from https://icons8.com/icon/set/household/small
    switch (status) {
      case 0: // unknown
      case 1: // not worn
        // No icon here. Width is set to 0
        break;
      case 2: // awake
        loadSettings();
        if (settings && !settings["hidewhenawake"]) g.drawImage(atob("GBjBAP//AAAAAAAAAAAADAAAPgAAIwABIzABsmABnmAMwMAef4AePwAeIwAeIwAeIwAeIwAf//gb//gYNhgftvgftngeNngAAAAAAAAAAAA="), w.x, w.y);
        break;
      case 3: // light sleep
        g.drawImage(atob("GBjBAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAABgAABgAABgAABnH/xnv/xlsARnsAZnMAZ///5gAAZgAAZgAAYAAAAAAAAAAAA="), w.x, w.y);
      case 4: // deep sleep
        g.drawImage(atob("GBjBAP//AAAAAAAAAAAAAeAD8OAD8cAA4fABwAADgABj8ABgAABgAABgAABnH/xnv/xlsARnsAZnMAZ///5gAAZgAAZgAAYAAAAAAAAAAAA="), w.x, w.y);
        break;
    }
  }};
  Bangle.drawWidgets();
})()
