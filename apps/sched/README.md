# Sched: Scheduling library for alarms and timers


This provides boot code, a library and tools for alarms and timers.

Other apps can use this to provide alarm functionality.

## App


The `Alarms & Timers` app allows you to add/modify any running alarms and timers.


### Snooze Menu

With sched version 0.35 or later, when an alarm or timer is triggered, and you have the latest cutting-edge firmware (or 2v28 when released), you can long press on the snooze button that pops up to go to a snooze menu, for finer control over snooze amounts. If you do not have the latest firmware, you will not notice any changes.

## Global Settings


- `Unlock at Buzz` - If `Yes` the alarm/timer will unlock the watch
- `Delete Expired Timers` - Default for whether expired timers are removed after firing.
- `Default Auto Snooze` - Default _Auto Snooze_ value for newly created alarms (_Alarms_ only)
- `Default Snooze` - Default _Snooze_ value for newly created alarms/timers
- `Buzz Count` - The number of buzzes before the watch goes silent, or "forever" to buzz until stopped.
- `Buzz Interval` - The interval between one buzz and the next
- `Default Alarm/Timer Pattern` - Default vibration pattern for newly created alarms/timers

## Internals / Library


Alarms are stored in an array in `sched.json`, and take the form:

```
{
  id : "mytimer",  // optional ID for this alarm/timer, so apps can easily find *their* timers
  appid : "myappid", // optional app ID for alarms that you set/use for your app
  on : true,       // is the alarm enabled?
  t : 23400000,    // Time of day since midnight in ms (if a timer, this is set automatically when timer starts)
  dow : 0b1111111, // Binary encoding for days of the week to run alarm on
    //  SUN = 1
    //  MON = 2
    //  TUE = 4
    //  WED = 8
    //  THU = 16
    //  FRI = 32
    //  SAT = 64

  date : "2022-04-04", // OPTIONAL date for the alarm, in YYYY-MM-DD format
                       // eg (new Date()).toISOString().substr(0,10)
  msg : "Eat food",    // message to display.
  last : 0,            // last day of the month we alarmed on - so we don't alarm twice in one day! (No change from 0 on timers)
  rp : true,           // repeat the alarm every day? If date is given, pass an object instead of a boolean,
                       // e.g. repeat every 2 months: { interval: "month", num: 2 }.
                       // Supported intervals: day, week, month, year
  vibrate : "...",     // OPTIONAL pattern of '.', '-' and ' ' to use for when buzzing out this alarm (defaults to '..' if not set)
  hidden : false,      // OPTIONAL if true, the widget should not show an icon for this alarm
  as : false,          // auto snooze
  timer : 5*60*1000,   // OPTIONAL - if set, this is a timer and it's the time in ms
  del : false,         // OPTIONAL - if true, delete the timer after expiration
  js : "load('myapp.js')" // OPTIONAL - a JS command to execute when the alarm activates (*instead* of loading 'sched.js')
                          // when this code is run, you're responsible for setting alarm.on=false (or removing the alarm)
  data : { ... }       // OPTIONAL - your app can store custom data in here if needed (don't store a lot of data here)
}
```

The [`sched` library](https://github.com/espruino/BangleApps/blob/master/apps/sched/lib.js) contains
a few helpful functions for getting/setting alarms and timers, but is intentionally sparse so as not to
use too much RAM.

It can be used as follows:

```
// Get a new alarm with default values
let alarm = require("sched").newDefaultAlarm();

// Get a new timer with default values
let timer = require("sched").newDefaultTimer();

// Add/update an existing alarm (using fields from the object shown above)
require("sched").setAlarm("mytimer", { // as a timer
  msg : "Wake up",
  timer : 10 * 60 * 1000 // 10 minutes
});
require("sched").setAlarm("myalarm", { // as an alarm
  msg : "Wake up",
  t : 9 * 3600000 // 9 o'clock (in ms)
});
require("sched").setAlarm("mydayalarm", { // as an alarm on a date
  msg : "Wake up",
  date : "2022-04-04",
  t : 9 * 3600000 // 9 o'clock (in ms)
});

// Ensure the widget and alarm timer updates to schedule the new alarm properly
require("sched").reload();

// Get the time to the next alarm for us
let timeToNext = require("sched").getTimeToAlarm(require("sched").getAlarm("mytimer"));
// timeToNext === undefined if no alarm or alarm disabled

// Delete an alarm
require("sched").setAlarm("mytimer", undefined);
// Reload after deleting
require("sched").reload();

// Or add an alarm that runs your own code - in this case
// loading the settings app. The alarm will not be removed/stopped
// automatically.
require("sched").setAlarm("customrunner", {
  appid : "myapp",
  js : "load('setting.app.js')",
  timer : 1 * 60 * 1000 // 1 minute
});

// If you have been specifying `appid` you can also find any alarms that
// your app has created with the following:
require("sched").getAlarms().filter(a => a.appid == "myapp");

// Get the scheduler settings
let settings = require("sched").getSettings();
```

If your app requires alarms, you can specify that the alarms app needs to
be installed by adding `"dependencies": {"scheduler":"type"},` to your app's
metadata.
