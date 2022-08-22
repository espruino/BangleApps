(function() {
  // 0: off, 1: buzz, 2: beep, 3: both
  var readSettings = () => {
    var settings = require("Storage").readJSON(FILE, 1) || {
      type: 1,
      freq: 0,
    };
    return settings;
  };

  var settings = readSettings()

  function chime() {
    if (settings.type == 0) return;
    if (settings.type&1) Bangle.buzz(100);
    if (settings.type&2) Bangle.beep();
  }

  let lastHour = (new Date()).getHours(); // don't chime when (re)loaded at a whole hour
  function check() {
    const now = new Date(),
      h = now.getHours(), m = now.getMinutes(),
      s = now.getSeconds(), ms = now.getMilliseconds();
    if (settings.freq == 1){
    if (h!==lastHour && m===30) chime();
    lastHour = h;
    // check again in 30 minutes
    const mLeft = 30-m, sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
    setTimeout(check, msLeft);
  }else if (settings.freq == 2){
    if (h!==lastHour && m===15) chime();
    lastHour = h;
    // check again in 15 minutes
    const mLeft = 15-m, sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
    setTimeout(check, msLeft);
  }else{
    if (h!==lastHour && m===0) chime();
    lastHour = h;
    // check again in 60 minutes
    const mLeft = 60-m, sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
    setTimeout(check, msLeft);
  }


  }

  check();
})
();