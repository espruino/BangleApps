
//Set LCD to zero through settings every reboot
let s = require("Storage").readJSON("setting.json", 1) || {};
s.brightness = 0; // Set brightness to 70% (value from 0 to 1)
require("Storage").writeJSON("setting.json", s);


let unlockedWithLongPress = false;
const longPressTime=300; //(ms)

Bangle.on('lock', function(isLocked) {
  if (!isLocked) {
    // Just unlocked — give a short delay and check if BTN1 is still pressed
    setTimeout(() => {
      if (digitalRead(BTN1)) {
        unlockedWithLongPress = true;
        Bangle.setLCDBrightness(0.1);
        setTimeout(()=>{
          Bangle.setLCDBrightness(0);
        },Bangle.getOptions().lcdTimeout);
      } else {
        Bangle.setLCDBrightness(0);
      }
    }, longPressTime); // Slight delay to allow unlock to settle
  }
});




