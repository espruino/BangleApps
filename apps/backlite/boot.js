
//Set LCD to zero every reboot
let s = require("Storage").readJSON("setting.json", 1) || {};
s.brightness = 0;
if (!("lcdTimeout" in s)) s.lcdTimeout = 5; // fallback so  logic doesn't break
require("Storage").writeJSON("setting.json", s);




let unlockedWithLongPress = false;
const longPressTime=400; //(ms)

Bangle.on('lock', function(isLocked) {
  Bangle.setLCDBrightness(0);

  if (!isLocked) {
    // Just unlocked — give a short delay and check if BTN1 is still pressed
    setTimeout(() => {
      if (digitalRead(BTN1)) {
        unlockedWithLongPress = true;
        Bangle.setLCDBrightness(0.1);
        setTimeout(()=>{
          Bangle.setLCDBrightness(0);
        },s.lcdTimeout*1000);
      } else {
        Bangle.setLCDBrightness(0);
      }
    }, longPressTime); // Slight delay to allow unlock to settle
  }
});




