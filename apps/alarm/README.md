Default Alarm & Timer
======================

This provides an app, widget, library and tools for alarms and timers.

Other apps can use this to provide alarm functionality.

App
---

The Alarm app allows you to add/modify any running timers.


Internals / Library
-------------------

Alarms are stored in an array in `alarm.json`, and take the form:

```
{
  id : "mytimer", // optional ID for this alarm/timer, so apps can easily find *their* timers
  on : true,      // is the alarm enabled?
  t : 23400000,   // Time of day since midnight in ms (if a timer, this is set automatically when timer starts)
  dow : 0b1111111, // Binary encoding for days of the week to run alarm on
    //  SUN = 1
    //  MON = 2
    //  TUE = 4
    //  WED = 8
    //  THU = 16
    //  FRI = 32
    //  SAT = 64    
  msg : "Eat chocolate", // message to display
  last : 0,       // last day of the month we alarmed on - so we don't alarm twice in one day!
  rp : true,      // repeat
  vibrate : "...", // pattern of '.', '-' and ' ' to use for when buzzing out this alarm (defaults to '..' if not set)
  as : false,     // auto snooze
  timer : 5*60*1000, // OPTIONAL - if set, this is a timer and it's the time in ms
  js : "load('myapp.js')" // OPTIONAL - a JS command to execute when the alarm activates (*instead* of loading 'alarm.js')
                          // when this code is run, you're responsible for setting alarm.on=false (or removing the alarm)
  data : { ... }          // OPTIONAL - your app can store custom data in here if needed
}
```

You app

The [`alarm` library](https://github.com/espruino/BangleApps/blob/master/apps/alarm/lib.js) contains
a few helpful functions for getting/setting alarms, but is intentionally sparse so as not to
use too much RAM.

It can be used as follows:

```
// add/update an existing alarm
require("alarm").setAlarm("mytimer", {
  msg : "Wake up",
  timer : 10*60*1000, // 10 Minutes
});
// Ensure the widget and alarm timer updates to schedule the new alarm properly
require("alarm").reload();

// Get the time to the next alarm for us
var timeToNext = require("alarm").getTimeToAlarm(require("alarm").getAlarm("mytimer"));
// timeToNext===undefined if no alarm or alarm disabled

// delete an alarm
require("alarm").setAlarm("mytimer", undefined);
// reload after deleting...
require("alarm").reload();

// Or add an alarm that runs your own code - in this case
// loading the settings app. The alarm will not be removed/stopped
// automatically.
require("alarm").setAlarm("customrunner", {
  js : "load('setting.app.js')",
  timer : 1*60*1000, // 1 Minute
});
```



If your app requires alarms, you can specify that the alarms app needs to
be installed by adding `"dependencies": {"alarm":"app"},` to your metadata.
