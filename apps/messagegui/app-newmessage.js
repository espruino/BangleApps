/* Called when we have a new message when we're in the clock...
BUZZ_ON_NEW_MESSAGE is set so when messagegui.app.js loads it knows
that it should buzz */
var settings; // Init:ed here to avoid lint warn, defined in eval below.
global.BUZZ_ON_NEW_MESSAGE = true;
eval(require("Storage").read("messagegui.app.js"));

// Add temporary listeners for unlocking watch.
if (settings.tempWakeOnFaceUp || settings.tempWakeOnTwist) {
  const options = Bangle.getOptions();
  if (!options.wakeOnFaceUp && !options.wakeOnTwist) { // If the user already uses a one arm method of unlocking it's unnecessary to do anything more.
    if (settings.tempWakeOnFaceUp) {
      Bangle.setOptions({wakeOnFaceUp:true});
      E.on("kill", ()=>{Bangle.setOptions({wakeOnFaceUp:false});});
    }
    if (settings.tempWakeOnTwist) {
      Bangle.setOptions({wakeOnTwist:true});
      E.on("kill", ()=>{Bangle.setOptions({wakeOnTwist:false});});
    }
  }
}
