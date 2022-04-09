Sched: Scheduling library for alarms and timers
====================================

This provides boot code, a library and tools for alarms and timers.

Other apps can use this to provide alarm functionality.

App
---

The Alarm app allows you to add/modify any running timers.


Internals / Library
-------------------

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
  rp : true,           // repeat the alarm every day?
  vibrate : "...",     // OPTIONAL pattern of '.', '-' and ' ' to use for when buzzing out this alarm (defaults to '..' if not set)
  hidden : false,      // OPTIONAL if false, the widget should not show an icon for this alarm
  as : false,          // auto snooze
  timer : 5*60*1000,   // OPTIONAL - if set, this is a timer and it's the time in ms
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
// add/update an existing alarm
require("sched").setAlarm("mytimer", {
  msg : "Wake up",
  timer : 10*60*1000, // 10 Minutes
});
// Ensure the widget and alarm timer updates to schedule the new alarm properly
require("sched").reload();

// Get the time to the next alarm for us
var timeToNext = require("sched").getTimeToAlarm(require("sched").getAlarm("mytimer"));
// timeToNext===undefined if no alarm or alarm disabled

// delete an alarm
require("sched").setAlarm("mytimer", undefined);
// reload after deleting...
require("sched").reload();

// Or add an alarm that runs your own code - in this case
// loading the settings app. The alarm will not be removed/stopped
// automatically.
require("sched").setAlarm("customrunner", {
  appid : "myapp",
  js : "load('setting.app.js')",
  timer : 1*60*1000, // 1 Minute
});

// If you have been specifying `appid` you can also find any alarms that
// your app has created with the following:
require("sched").getAlarms().filter(a=>a.appid=="myapp");
```

If your app requires alarms, you can specify that the alarms app needs to
be installed by adding `"dependencies": {"scheduler":"type"},` to your app's
metadata.
