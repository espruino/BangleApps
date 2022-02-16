# Sleep Log

This app logs and displays the four following states:  
_unknown, not worn, awake, sleeping_  
It derived from the [SleepPhaseAlarm](https://banglejs.com/apps/#sleepphasealarm) and uses the accelerometer to estimate sleep and wake states with the principle of Estimation of Stationary Sleep-segments ([ESS](https://ubicomp.eti.uni-siegen.de/home/datasets/ichi14/index.html.en)) and
also provides a power saving mode using the built in movement calculation. The internal temperature is used to decide if the status is _sleeping_ or _not worn_.

#### Operating Principle
* __ESS calculation__  
  The accelerometer polls values with 12.5Hz. On each poll the magnitude value is saved. When 13 values are collected, every 1.04 seconds, the standard deviation over this values is calculated.  
  Is the calculated standard deviation lower than the "no movement" threshold (__NoMo Thresh__) a "no movement" counter is incremented. Each time the "no movement" threshold is reached the "no movement" counter will be reset. The first time no movement is detected the actual timestamp is cached (in _sleeplog.firstnomodate_) for logging.  
  When the "no movement" counter reaches the sleep threshold the watch is considered as resting. (The sleep threshold is calculated from the __Min Duration__ setting, Example: _sleep threshold = Min Duration * 60 / calculation interval => 10min * 60s/min / 1.04s ~= 576,9 rounded up to 577_)
* __Power Saving Mode__  
  On power saving mode the movement value of bangle's build in health event is checked against the maximal movement threshold (__Max Move__). The event is only triggered every 10 minutes which decreases the battery impact but also reduces accurracy.
* ___Sleeping___ __or__ ___Not Worn___  
  To check if a resting watch indicates a sleeping status, the internal temperature must be greater than the temperature threshold (__Temp Thresh__). Otherwise the watch is considered as not worn.
* __True Sleep__  
  The true sleep value is a simple addition of all registert sleeping periods.
* __Consecutive Sleep__  
  In addition the consecutive sleep value tries to predict the complete time you were asleep, even the light sleeping phases with registered movements. All periods after a sleeping period will be summarized til the first following non sleeping period that is longer then the maximal awake duration (__Max Awake__). If this sum is lower than the minimal consecutive sleep duration (__Min Consec__) it is not considered, otherwise it will be added to the consecutive sleep value.
* __Logging__  
  To minimize the log size only a changed state is logged. The logged timestamp is matching the beginning of its measurement period.  
  When not on power saving mode a movement is detected nearly instantaneous and the detection of a no movement period is delayed by the minimal no movement duration. To match the beginning of the measurement period a cached timestamp (_sleeplog.firstnomodate_) is logged.  
  On power saving mode the measurement period is fixed to 10 minutes and all logged timestamps are also set back 10 minutes.

---
### Control
---
* __Swipe__  
  Swipe left/right to display the previous/following day.
* __Touch__ / __BTN__  
  Touch the screen to open the settings menu to exit or change settings.

---
### Settings
---
* __Break Tod__ | break at time of day  
  _0_ / _1_ / _..._ / __10__ / _..._ / _12_  
  Change time of day on wich the lower graph starts and the upper graph ends. 
* __Max Awake__ | maximal awake duration  
  _15min_ / _20min_ / _..._ / __60min__ / _..._ / _120min_  
  Adjust the maximal awake duration upon the exceeding of which aborts the consecutive sleep period.
* __Min Consec__ | minimal consecutive sleep duration  
  _15min_ / _20min_ / _..._ / __30min__ / _..._ / _120min_  
  Adjust the minimal consecutive sleep duration that will be considered for the consecutive sleep value.
* __Temp Thresh__ | temperature threshold  
  _20°C_ / _20.5°C_ / _..._ / __25°C__ / _..._ / _40°C_  
  The internal temperature must be greater than this threshold to log _sleeping_, otherwise it is _not worn_.
* __Power Saving__  
  _on_ / __off__  
  En-/Disable power saving mode. _Saves battery, but might decrease accurracy._  
  In app icon showing that power saving mode is enabled: ![](powersaving.png)
* __Max Move__ | maximal movement threshold  
  (only available when on power saving mode)  
  _50_ / _51_ / _..._ / __100__ / _..._ / _200_  
  On power saving mode the watch is considered resting if this threshold is lower or equal to the movement value of bangle's health event.
* __NoMo Thresh__ | no movement threshold  
  (only available when not on power saving mode)  
  _0.006_ / _0.007_ / _..._ / __0.012__ / _..._ / _0.020_  
  The standard deviation over the measured values needs to be lower then this threshold to count as not moving.  
  The defaut threshold value worked best for my watch. A threshold value below 0.008 may get triggert by noise.
* __Min Duration__ | minimal no movement duration  
  (only available when not on power saving mode)  
  _5min_ / _6min_ / _..._ / __10min__ / _..._ / _15min_  
  If no movement is detected for this duration, the watch is considered as resting.
* __Enabled__  
  __on__ / _off_  
  En-/Disable the service (all background activities). _Saves the most battery, but might make this app useless._  
  In app icon showing that the service is disabled: ![](disabled.png)
* __Logfile__  
  __default__ / _off_  
  En-/Disable logging by setting the logfile to _sleeplog.log_ / _undefined_.  
  If the logfile has been customized it is displayed with _custom_.  
  In app icon showing that logging is disabled: ![](nolog.png)
  
---
### Global Object and Module Functions
---
For easy access from the console or other apps the following parameters, values and functions are noteworthy:
```
>global.sleeplog
={
  enabled: true,                // bool   / service status indicator
  logfile: "sleeplog.log",      // string / used logfile
  resting: false,               // bool   / indicates if the watch is resting
  status: 2,                    // int    / actual status:
    / undefined = service stopped, 0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping
  firstnomodate: 1644435877595, // number / Date.now() from first recognised no movement, not available in power saving mode
  stop: function () { ... },    // funct  / stops the service until the next load()
  start: function () { ... },   // funct  / restarts the service
  ...
 }

>require("sleeplog")
={
  setEnabled: function (enable, logfile, powersaving) { ... },
    // restarts the service with changed settings
    // * enable        / bool / new service status
    // * logfile       / bool or string
    //   - true            = enables logging to "sleeplog.log"
    //   - "some_file.log" = enables logging to "some_file.log"
    //   - false           = disables logging
    // * (powersaving) / bool / new power saving status, default: false
    // returns: true or undefined
    // - true      = service restart executed
    // - undefined = no global.sleeplog found
  readLog: function (logfile, since, until) { ... },
    // read the raw log data for a specific time period
    // * logfile / string / on no string uses logfile from global object or "sleeplog.log" 
    // * (since) / Date or number / startpoint of period, default: 0
    // * (until) / Date or number / endpoint of period, default: 1E14
    // returns: array
    // * [[number, int, string], [...], ... ] / sorting: latest first
    //   - number // timestamp in ms
    //   - int    // status: 0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping
    //   - string // additional information
    // * [] = no data available or global.sleeplog not found
  writeLog: function (logfile, input) { ... },
    // append or replace log depending on input
    // * logfile / string / on no string uses logfile from global object or default 
    // * input   / array
    //   - append input if array length >1 and element[0] >9E11
    //   - replace log with input if at least one entry like above is inside another array
    // returns: true or undefined
    // - true      = changest written to storage
    // - undefined = wrong input
  getReadableLog: function (printLog, since, until, logfile) { ... }
    // read the log data as humanreadable string for a specific time period
    // * (printLog) / bool / direct print output with additional information, default: false
    // * (since)    / Date or number / see readLog(..)
    // * (until)    / Date or number / see readLog(..)
    // * (logfile)  / string / see readLog(..)
    // returns: string
    // * "{substring of ISO date} - {status} for {duration}min\n...", sorting: latest last
    // * undefined = no data available or global.sleeplog found
  restoreLog: function (logfile) { ... }
    // eliminate some errors inside a specific logfile
    // * (logfile)  / string / see readLog(..)
    // returns: int / number of changes that were made
  reinterpretTemp: function (logfile, tempthresh) { ... }
    // reinterpret worn status based on given temperature threshold
    // * (logfile)    / string / see readLog(..)
    // * (tempthresh) / float  / new temperature threshold, on default uses tempthresh from global object or 27
    // returns: int / number of changes that were made
 }
```

---
### Worth Mentioning
---
#### To do list
* Send the logged information to Gadgetbridge.
  _(For now I have no idea how to achieve this, help is appreciated.)_
* View, down- and upload log functions via App Loader.
* Calculate and display overall sleep statistics.
* Option to automatically change power saving mode depending on time of day.

#### Requests, Bugs and Feedback
Please leave requests and bug reports by raising an issue at [github.com/storm64/BangleApps](https://github.com/storm64/BangleApps) or send me a [mail](mailto:banglejs@storm64.de).

#### Creator
Storm64 ([Mail](mailto:banglejs@storm64.de), [github](https://github.com/storm64))

#### Contributors
nxdefiant ([github](https://github.com/nxdefiant))

#### Attributions
* ESS calculation based on nxdefiant interpretation of the following publication by:  
  Marko Borazio, Eugen Berlin, Nagihan Kücükyildiz, Philipp M. Scholl and Kristof Van Laerhoven  
  [Towards a Benchmark for Wearable Sleep Analysis with Inertial Wrist-worn Sensing Units](https://ubicomp.eti.uni-siegen.de/home/datasets/ichi14/index.html.en),  
  ICHI 2014, Verona, Italy, IEEE Press, 2014.
* Icons used in this app are from [https://icons8.com](https://icons8.com).

#### License
[MIT License](LICENSE)
