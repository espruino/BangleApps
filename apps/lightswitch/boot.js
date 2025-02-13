{
// load settings
let settings = Object.assign({
  value: 1,
  isOn: true
}, require("Storage").readJSON("lightswitch.json", true) || {});

// set brightness
Bangle.setLCDBrightness(settings.isOn ? settings.value : 0);

// remove tap listener to prevent uncertainties
Bangle.removeListener("tap", require("lightswitch.js").tapListener);

// add tap listener to unlock and/or flash backlight
if (settings.unlockSide || settings.tapSide) Bangle.on("tap", require("lightswitch.js").tapListener);
}
