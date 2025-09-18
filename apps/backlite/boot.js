{
  let getSettings = function(){
    return Object.assign({
      // default values
      brightness: 0.3,

    }, require('Storage').readJSON("BackLite.settings.json", true) || {});
  };

  
  //Set LCD to zero every reboot
  let s = require("Storage").readJSON("setting.json", 1) || {};
  s.brightness = 0;
  if (!("lcdTimeout" in s)) s.lcdTimeout = 5; // fallback so  logic doesn't break
  require("Storage").writeJSON("setting.json", s);
  //remove large settings object from memory
  s=null;
  const longPressTime=400; //(ms)
  var longPressTimer;
  Bangle.on('lock', function(isLocked) {
    Bangle.setLCDBrightness(0);

    if (!isLocked) {
      // Just unlocked — give a short delay and check if BTN1 is still pressed
      longPressTimer=setTimeout(() => {
        if (digitalRead(BTN1)) {
          //set brightness until. locked.
          Bangle.setLCDBrightness(getSettings().brightness);
        } else {
          Bangle.setLCDBrightness(0);
        }
        longPressTimer = null;
      }, longPressTime); // Slight delay to allow unlock to settle
    }
  });

  
  
  setWatch(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }, BTN1, { repeat:true, edge:'rising' });
}

