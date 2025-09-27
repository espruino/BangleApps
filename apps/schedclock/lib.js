const SETTINGS_FILE = "schedclock.settings.json";
const APP_ID = "schedclock";

/**
 * Called directly by an alarm to load a specific clock face
 * @param {string} faceSrc - Source file of the clock face to load (e.g. "myclock.js")
 **/ 
const setClock = function(faceSrc) {
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
 * Handle alarms and resetting them
 * @param {number} index Index of the alarm that went off
 * @param {string} clock Clockface
 */
exports.onAlarm = function(index, clock) {
  const date = new Date();
  const Sched = require("sched");
  const alarm = Sched.getAlarm(`${APP_ID}.${index}`);
  alarm.last = date.getDate(); // prevent second run on the same day
  Sched.setAlarm(alarm.id, alarm);
  setClock(clock);
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

  // Alarms need "last" set to let sched know they've already ran for the day
  // So if an alarm is for before "now", set last to yesterday so it still triggers today
  // else set last to today.
  const currentDate = new Date();
  const currentTime = (currentDate.getHours()*3600000)+(currentDate.getMinutes()*60000)+(currentDate.getSeconds()*1000);
  const dayOfMonthToday = currentDate.getDate();
  const dayOfMonthYesterday = dayOfMonthToday - 1;

  // Add a new alarm for each setting item
  settings.sched.forEach((item, index) => {
    
    // Skip invalid records
    if (item.hour === undefined || item.minute === undefined) return;

    const scheduledTime = (item.hour * 3600000) + (item.minute * 60000);

    // Create the new alarm object and save it using a unique ID.
    Sched.setAlarm(`${APP_ID}.${index}`, {
      t: scheduledTime, // time in milliseconds since midnight
      on: true,
      rp: true,
      last: (scheduledTime > currentTime) ? dayOfMonthYesterday : dayOfMonthToday,
      dow: item.dow,
      hidden: true,
      appid: APP_ID,
      js: `require('${APP_ID}.lib.js').onAlarm(${index},'${item.face}')`,
    });
  });
};
