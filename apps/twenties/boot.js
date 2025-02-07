{ // This boot script is deleted once the companion alarm is set up.
  // The app will continue working by having the alarm rearm itself until
  // the app is uninstalled.
let alarms = require("Storage").readJSON("sched.json", 1) || [];
if (!alarms.includes(a => a.id === "twenties")) {require("twenties").setup(alarms);}
}
