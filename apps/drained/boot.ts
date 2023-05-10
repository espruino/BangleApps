(() => {
const { battery: threshold = 5, interval = 10, keepStartup = true }: DrainedSettings
  = require("Storage").readJSON(`drained.setting.json`, true) || {};

drainedInterval = setInterval(() => {
  if(Bangle.isCharging())
    return;
  if(E.getBattery() > threshold)
    return;

  const app = "drained.app.js";

  if(!keepStartup)
    require("Storage").write(
      ".boot0",
      `if(typeof __FILE__ === "undefined" || __FILE__ !== "${app}") setTimeout(load, 100, "${app}");`
    );

  load(app);
}, interval * 60 * 1000);
})()
