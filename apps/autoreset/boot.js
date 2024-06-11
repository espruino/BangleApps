{
const DEFAULTS = {
  mode: 0,
  apps: [],
  timeout: 10
};
const settings = require("Storage").readJSON("autoreset.json", 1) || DEFAULTS;

// Check if the back button should be enabled for the current app.
// app is the src file of the app.
// Derivative of the backswipe app's logic.
function enabledForApp(app) {
  if (Bangle.CLOCK==1) return false;
  if (!settings) return true;
  let isListed = settings.apps.filter((a) => a.files.includes(app)).length > 0;
  return settings.mode===0?!isListed:isListed;
}

let timeoutAutoreset;
const resetTimeoutAutoreset = (force)=>{
  if (timeoutAutoreset) clearTimeout(timeoutAutoreset);
  setTimeout(()=>{ // Short outer timeout to make sure we have time to leave clock face before checking `Bangle.CLOCK!=1`.
    if (enabledForApp(global.__FILE__)) {
      timeoutAutoreset = setTimeout(()=>{
        if (Bangle.CLOCK!=1) Bangle.showClock();
      }, settings.timeout*60*1000);
    }
  },200);
};

Bangle.on('touch', resetTimeoutAutoreset);
Bangle.on('swipe', resetTimeoutAutoreset);
Bangle.on('message', resetTimeoutAutoreset);
setWatch(resetTimeoutAutoreset, BTN, {repeat:true, edge:'rising'});

if (Bangle.CLOCK!=1) resetTimeoutAutoreset();
}
