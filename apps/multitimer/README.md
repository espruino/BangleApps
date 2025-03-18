# Multi Timer
With this app, you can set timers and chronographs (stopwatches) and watch them count down/up in real time. You can also set alarms - swipe left or right to switch between the three functions.

"Hard mode" is also available for timers and alarms. It will double the number of buzz counts and you will have to swipe the screen five to eight times correctly - make a mistake, and you will need to start over.
"Delete after expiration" can be set on a timer/alarm to have it delete itself once it's sounded (the same as the alarm app).

## WARNING
* Editing timers in another app (such as the default Alarm app) is not recommended. Editing alarms should not be a problem (in theory).
* This app uses the [Scheduler library](https://banglejs.com/apps/?id=sched).
* To avoid potential conflicts with other apps that uses sched (especially ones that make use of the data and js field), this app only lists timers and alarms that it created - any made outside the app will be ignored. GB alarms are currently an exception as they do not make use of the data and js field.
* A keyboard app is only used for adding messages to timers and is therefore not strictly needed.
