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
          if (settings && !settings["hidewhenawake"]) g.drawImage(atob("GBiBAf////////////j///h///p///h//////5///5h//5h//5J//5JgA5JAA5tP+5vP+ZjP+YAAAZ//+Z//+Z//+f///////////w=="), w.x, w.y);
          break;
        case 3: // light sleep
          g.drawImage(atob("GBiBAf///////////////////////////////5///5///5///5///5jgA5hAA5pP+5hP+ZjP+YAAAZ//+Z//+Z//+f///////////w=="), w.x, w.y);
          break;
        case 4: // deep sleep
          g.drawImage(atob("GBiBAf/////////+H/wPH/wOP/8eD/4///x//5wP/5///5///5///5jgA5hAA5pP+5hP+ZjP+YAAAZ//+Z//+Z//+f///////////w=="), w.x, w.y);
          break;
      }
    }
  };

  setInterval(()=>{
    WIDGETS.sleepstatus.draw(WIDGETS.sleepstatus);
  }, 60000);
  
  Bangle.drawWidgets();
})()
