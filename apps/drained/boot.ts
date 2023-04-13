const { battery = 5, interval = 10, disableBoot = false }: DrainedSettings
  = require("Storage").readJSON(`drained.setting.json`, true) || {};

if(disableBoot){
  require("Storage").erase(".boot0");

  Bangle.on("charging", charging => {
    if (charging)
      eval(require('Storage').read('bootupdate.js'));
  });
}

drainedInterval = setInterval(() => {
  if(Bangle.isCharging())
    return;
  if(E.getBattery() > battery)
    return;

  load("drained.app.js");
}, interval * 60 * 1000);
