const { battery = 5, interval = 10 }: DrainedSettings = require("Storage")
  .readJSON(`${app}.setting.json`, true) || {};

let drainedInterval: number | undefined = setInterval(() => {
  if(Bangle.isCharging())
    return;
  if(E.getBattery() > battery)
    return;

  load("drained.app.js");
}, interval * 60 * 1000);
