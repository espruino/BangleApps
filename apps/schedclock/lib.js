const SETTINGS_FILE = "schedclock.settings.json";

// Called directly by an alarm to load a specific clock face
exports.loadFace = function(faceSrc) {
  const settings = require("Storage").readJSON("setting.json", 1) || {};
  // Only change the clock if it's different
  if (faceSrc && settings.clock !== faceSrc) {
    const face = require("Storage").read(faceSrc);
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

// Function to sync all alarms in the scheduler with the settings file.
// This is the new core logic for the app.
exports.syncAlarms = function() {
  const settings = require("Storage").readJSON(SETTINGS_FILE, 1) || [];

  // Remove all existing alarms from the scheduler library
  const alarms = require("sched")
    .getAlarms()
    .filter(a => a.appid && a.appid === "schedclock")
    .forEach(a => require("sched").setAlarm(a.id, undefined));

  // If the app is disabled, we're done.
  if (!settings.enabled) return;

  // Add a new alarm for each setting item
  settings.sched.forEach((item, index) => {
    
    if (item.hour === undefined) return;

    // Create the new alarm object and save it using a unique ID.
    require("sched").setAlarm(`schedclock.${index}`, {
      on: true,
      appid: "schedclock",
      t: (item.hour * 3600000) + (item.minute * 60000), // time in milliseconds since midnight
      dow: item.dow,
      hidden: true,
      rp: {interval: "week"},
      js: `require('schedclock.lib.js').loadFace('${item.face}')`,
    });
  });
};

