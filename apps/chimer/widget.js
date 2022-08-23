(function() {
  // 0: off, 1: buzz, 2: beep, 3: both
  var readSettings = () => {
    var settings = require("Storage").readJSON(FILE, 1) || {
      type: 1,
      freq: 2,
      repeat: 1,
    };
    return settings;
  };

  var settings = readSettings();

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  function chime() {
    Bangle.buzz(100);
    for(var i = 0; i < settings.repeat; i++){
    if (settings.type === 1){
      Bangle.buzz(100);
    } else if(settings.type === 2){
      Bangle.beep();
    } else {
      return;
    }
  }
  };

  //let lastHour = (new Date()).getHours(); // don't chime when (re)loaded at a whole hour h!==lastHour
  function check() {
    const now = new Date(),
      h = now.getHours(), m = now.getMinutes(),
      s = now.getSeconds(), ms = now.getMilliseconds();
    if (settings.freq === 1){
    if (m===0 || m===30) chime();
    lastHour = h;
    // check again in 30 minutes
    switch (true){
      case (m/30 >= 1):
        var mLeft = 30-(m-30), sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
        break;
      case (m/30 < 1):
        var mLeft = 30-m, sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
        break;
    }
    setTimeout(check, msLeft);

  }else if (settings.freq === 2){
    if (m===0 || m===15 || m===30 || m===45) chime();
    lastHour = h;
    // check again in 15 minutes
    switch (true){
      case (m/15 >= 3):
        var mLeft = 15-(m-45), sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
        break;
      case (m/15 >= 2):
        var mLeft = 15-(m-30), sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
        break;
      case (m/15 >= 1):
        var mLeft = 15-(m-15), sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
        break;
      case (m/15 < 1):
        var mLeft = 15-m, sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
        break;
    }
    setTimeout(check, msLeft);
    }else if (settings.freq === 3){
    chime();
    lastHour = h;
    // check again in 1 minute

    var mLeft = 1, sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
    setTimeout(check, msLeft);

  }else{
    if (m===0) chime();
    lastHour = h;
    // check again in 60 minutes
    var mLeft = 60-m, sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
    setTimeout(check, msLeft);

  }



  };

  check();
})
();