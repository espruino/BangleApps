(function() {
  if (!sleeplog) return;
  const SETTINGS_FILE = 'widsleepstatus.json';
  let settings;

  function loadSettings() {
    settings = require('Storage').readJSON(SETTINGS_FILE, 1) || {};
    const DEFAULTS = {
      'hidewhenawake': true
    };
    Object.keys(DEFAULTS).forEach(k => {
      if (settings[k] === undefined) settings[k] = DEFAULTS[k];
    });
  }
  loadSettings();

  WIDGETS.sleepstatus = {
    area: "tr",
    width: 0,
    draw: function(w) {
      let status = sleeplog.status || 0;
      if (w.width != (status >= 2 ? 24 : 0)){
        w.width = status >= 2 ? 24 : 0;
        return Bangle.drawWidgets();
      }
      g.reset();
      switch (status) {
        case 0:
        case 1:
          break;
        case 2: // awake
          if (settings && !settings["hidewhenawake"]) g.drawImage(atob("GBiBAAAAAAAAAAAMAAA+AAAjAAEjMAGyYAGeYAzAwB5/gB4/AB4jAB4jAB4jAB4jAB//+Bv/+Bg2GB+2+B+2eB42eAAAAAAAAAAAAA=="), w.x, w.y);
          break;
        case 3: // light sleep
          g.drawImage(atob("GBiBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAGAAAGAAAGAAAGcf/Ge//GWwBGewBmcwBn///mAABmAABmAABgAAAAAAAAAAAA=="), w.x, w.y);
          break;
        case 4: // deep sleep
          g.drawImage(atob("GBiBAAAAAAAAAAAB4APw4APxwADh8AHAAAOAAGPwAGAAAGAAAGAAAGcf/Ge//GWwBGewBmcwBn///mAABmAABmAABgAAAAAAAAAAAA=="), w.x, w.y);
          break;
      }
    }
  };

  setInterval(()=>{
    WIDGETS.sleepstatus.draw(WIDGETS.sleepstatus);
  }, 60000);

  Bangle.drawWidgets();
})()
