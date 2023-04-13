{
const { battery: threshold = 5, interval = 10, disableBoot = false }: DrainedSettings
  = require("Storage").readJSON(`drained.setting.json`, true) || {};

drainedInterval = setInterval(() => {
  if(Bangle.isCharging())
    return;
  if(E.getBattery() > threshold)
    return;

  if(disableBoot)
    require("Storage").erase(".boot0");

  load("drained.app.js");
}, interval * 60 * 1000);
}
