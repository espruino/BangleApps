# Sleep Log

This app logs and displays the four following states:  
_unknown, not worn, awake, sleeping_  
It derived from the [SleepPhaseAlarm](https://banglejs.com/apps/#sleepphasealarm) and uses the accelerometer to estimate sleep and wake states with the principle of Estimation of Stationary Sleep-segments ([ESS](https://ubicomp.eti.uni-siegen.de/home/datasets/ichi14/index.html.en)) and the internal temperature to decide _sleeping_ or _not worn_ when the watch is resting.

#### Operating Principle
* __ESS calculation__  
  The accelerometer polls values with 12.5Hz. On each poll the magnitude value is saved. When 13 values are collected, every 1.04 seconds, the standard deviation over this values is calculated.  
  Is the calculated standard deviation lower than the "no movement" threshold (__NoMoThresh__) a "no movement" counter is incremented. Each time the "no movement" threshold is reached the "no movement" counter will be reset.  
  When the "no movement" counter reaches the sleep threshold the watch is considered as resting. (The sleep threshold is calculated from the __MinDuration__ setting, Example: _sleep threshold = MinDuration * 60 / calculation interval => 10min * 60s/min / 1.04s ~= 576,9 rounded up to 577_)  
  To check if a resting watch indicates as sleeping, the internal temperature must be greater than the temperature threshold (__TempThresh__). Otherwise the watch is considered as not worn.
* __True Sleep__  
  The true sleep value is a simple addition of all registert sleeping periods.
* __Consecutive Sleep__  
  In addition the consecutive sleep value tries to predict the complete time you were asleep, even the light sleeping phases with registered movements. All periods after a sleeping period will be summarized til the first following non sleeping period that is longer then the maximal awake duration (__MaxAwake__). If this sum is lower than the minimal consecutive sleep duration (__MinConsec__) it is not considered, otherwise it will be added to the consecutive sleep value.
* __Logging__  
  To minimize the log size only a changed state is logged.

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
* __BreakTod__ break at time of day  
  _0_ / _1_ / _..._ / __10__ / _..._ / _12_  
  Change time of day on wich the lower graph starts and the upper graph ends. 
* __MaxAwake__ maximal awake duration  
  _15min_ / _20min_ / _..._ / __60min__ / _..._ / _120min_  
  Adjust the maximal awake duration upon the exceeding of which aborts the consecutive sleep period.
* __MinConsec__ minimal consecutive sleep duration  
  _15min_ / _20min_ / _..._ / __30min__ / _..._ / _120min_  
  Adjust the minimal consecutive sleep duration that will be considered for the consecutive sleep value.
* __TempThresh__ temperature threshold  
  _20°C_ / _20.5°C_ / _..._ / __25°C__ / _..._ / _40°C_  
  The internal temperature must be greater than this threshold to log _sleeping_, otherwise it is _not worn_.
* __NoMoThresh__ no movement threshold  
  _0.006_ / _0.007_ / _..._ / __0.012__ / _..._ / _0.020_  
  The standard deviation over the measured values needs to be lower then this threshold to count as not moving.  
  The defaut threshold value worked best for my watch. A threshold value below 0.008 may get triggert by noise.
* __MinDuration__ minimal no movement duration  
  _5min_ / _6min_ / _..._ / __10min__ / _..._ / _15min_  
  If no movement is detected for this duration, the watch is considered as resting.
* __Enabled__  
  __on__ / _off_  
  En-/Disable the service (all background activities). _Saves battery, but might make this app useless._
* __Logfile__  
  __default__ / _off_  
  En-/Disable logging by setting the logfile to _sleeplog.log_ / _undefined_.  
  If the logfile has been customized it is displayed with _custom_.
  
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
  status: 2,                    // int    / actual status: 0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping
  firstnomodate: 1644435877595, // number / Date.now() from first recognised no movement
  stop: function () { ... },    // funct  / stops the service until the next load()
  start: function () { ... },   // funct  / restarts the service
  ...
 }

>require("sleeplog")
={
  setEnabled: function (enable, logfile) { ... },
    // en-/disable the service and/or logging
    // * enable  / bool / service status to change to
    // * logfile / bool or string
    //   - true            = enables logging to "sleeplog.log"
    //   - "some_file.log" = enables logging to "some_file.log"
    //   - false           = disables logging
    // returns: bool or undefined
    // - true      = changes executed
    // - false     = no changes needed
    // - undefined = no global.sleeplog found
  readLog: function (since, until) { ... },
    // read the raw log data for a specific time period
    // * since / Date or number / startpoint of period
    // * until / Date or number / endpoint of period
    // returns: array
    // * [[number, int, string], [...], ... ] / sorting: latest first
    //   - number // timestamp in ms
    //   - int    // status: 0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping
    //   - string // additional information
    // * [] = no data available or global.sleeplog found
  getReadableLog: function (printLog, since, until) { ... }
    // read the log data as humanreadable string for a specific time period
    // * since / Date or number / startpoint of period
    // * until / Date or number / endpoint of period
    // returns: string
    // * "{substring of ISO date} - {status} for {duration}min\n...", sorting: latest last
    // * undefined = no data available or global.sleeplog found
  restoreLog: function (logfile) { ... }
    // eliminate some errors inside a specific logfile
    // * logfile / string / name of the logfile that will be restored
    // returns: int / number of changes that were made
  reinterpretTemp: function (logfile, tempthresh) { ... }
    // reinterpret worn status based on given temperature threshold
    // * logfile    / string / name of the logfile
    // * tempthresh / float  / new temperature threshold
    // returns: int / number of changes that were made
 }
```

---
### Worth Mentioning
---
#### To do list
* Send the logged information to Gadgetbridge.
  _(For now I have no idea how to achieve this, help is appreciated.)_
* Calculate and display overall sleep statistics.

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
