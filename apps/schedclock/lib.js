const SETTINGS_FILE = "schedclock.settings.json";
const APP_ID = "schedclock";

/**
 * Called directly by an alarm to load a specific clock face
 * @param {string} faceSrc - Source file of the clock face to load (e.g. "myclock.js")
 **/ 
exports.loadFace = function(faceSrc) {
  const settings = require("Storage").readJSON("setting.json", 1) || {};
  // Only change the clock if it's different
  if (faceSrc && settings.clock !== faceSrc) {
    const face = require("Storage").read(faceSrc);
    // If the face doesn't exist, do nothing (but log it)
    if (!face) {
      console.log("schedclock: Invalid clock face", faceSrc);
      return;
    }
    settings.clock = faceSrc;
    settings.clockHasWidgets = face.includes("Bangle.loadWidgets");
    require("Storage").writeJSON("setting.json", settings);
    if(Bangle.CLOCK) load(); // Reload clock if we're on it
  }
};

/**
 * Function to sync all alarms in the scheduler with the settings file.
 * Called every time settings are changed; maybe a bit excessive, but keeps things simple.
 **/
exports.syncAlarms = function() {
  const Sched = require("sched");
  const settings = require("Storage").readJSON(SETTINGS_FILE, 1) || [];

  // Remove all existing alarms from the scheduler library
  Sched
    .getAlarms()
    .filter(a => a.appid && a.appid === APP_ID)
    .forEach(a => Sched.setAlarm(a.id, undefined));

  // If the app is disabled, we're done.
  if (!settings.enabled) return;

  // Add a new alarm for each setting item
  settings.sched.forEach((item, index) => {
    
    if (item.hour === undefined) return;

    // Create the new alarm object and save it using a unique ID.
    Sched.setAlarm(`${APP_ID}.${index}`, {
      on: true,
      appid: APP_ID,
      t: (item.hour * 3600000) + (item.minute * 60000), // time in milliseconds since midnight
      dow: item.dow,
      hidden: true,
      rp: {interval: "week"},
      js: `require('${APP_ID}.lib.js').loadFace('${item.face}')`,
    });
  });
};

