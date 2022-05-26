# Sleep Log

This app logs and displays the following states:  
- sleepling status: _unknown, not worn, awake, light sleep, deep sleep_
- consecutive sleep status: _unknown, not consecutive, consecutive_

It is using the built in movement calculation to decide your sleeping state. While charging it is assumed that you are not wearing the watch and if the status changes to _deep sleep_ the internal heartrate sensor is used to detect if you are wearing the watch.

````diff
-+-                       -+-
-+-     BETA Version      -+-
-+-                       -+-
````


---
### Introduction
---
I am proud to present the new sleeplog app: version 0.10 🎉 ✨ 🎊

Sorry that it took so long but hopefully most of the early bugs are sorted out and the app should be ready to be use and get tested!

I would love to hear about your impressions and like to know your choice of thresholds, to set the default values as optimized as possible.

The last piece of work is to rewrite the README.md to show how to use it and show the restrictions and possibilities.
But here are some explanations how to use the app and settings:

- __On the app screen:__
  - swipe left & right to change the displayed day
  - touch on the "title" (e.g. `Night to Fri 20/05/2022`) to enter a day selection prompt
  - touch on the info area (by default displaying consecutive and true sleeping) to change the displayed information
  - touch on the wrench (upper right corner) to enter the settings
  - exit the app with the UI back button widget on the upper left corner

- __Inside the settings:__
  - the threshold values are accessible through a submenu
  - app timeout lets you specify a separate `lockTimeout` and `backlightTimeout` only for the sleeplog app
  - debug settings are available in a submenu down at the end:
    - display log is not implemented yet
    - options `Enable` and `write File` should be self explaining
    - the `Duration` specifies how long data should be written into the .csv file
    - the .csv file loggs the following data (timestamps are in days since 1900-01-01 00:00 UTC as used by office software):  
      _timestamp, movement, status, consecutive, asleepSince, awakeSince, bpm, bpmConfidence_

- __Timestamps and files:__
  1. externally visible/usable timestamps (in `global.sleeplog`) are formatted as Bangle timestamps:  
    seconds since 1970-01-01 00:00 UTC
  2. internally used and logged (to `sleeplog.log (StorageFile)`) is within the highest available resolution:  
    10 minutes since 1970-01-01 00:00 UTC (`Bangle / (10 * 60 * 1000)`)
  3. debug .csv file ID (`sleeplog_123456.csv`) has a hourly resolution:
    hours since 1970-01-01 00:00 UTC (`Bangle / (60 * 60 * 1000)`)
  4. logged timestamps inside the debug .csv file are formatted for office calculation software:
    days since 1900-01-01 00:00 UTC (`Bangle / (24 * 60 * 60 * 1000) + 25569`)
  5. every 14 days the `sleeplog.log (StorageFile)` is reduced and old entries are moved into separat files for each fortnight (`sleeplog_1234.log`) but still accessible though the app:  
    fortnights since 1970-01-04 12:00 UTC (converted with `require("sleeplog").msToFn(Bangle)` and `require("sleeplog").fnToMs(fortnight)`)

- __Logfiles from before 0.10:__  
  timestamps and sleeping status of old logfiles are automatically converted on your first consecutive sleep or manually by `require("sleeplog").convertOldLog()`

- __View logged data:__  
  if you'd like to view your logged data in the IDE, you can access it with `require("sleeplog").printLog(since, until)` or `require("sleeplog").readLog(since, until)` to view the raw data  
  since & until in Bangle timestamp, e.g. `require("sleeplog").printLog(Date()-24*60*60*1000, Date())` for the last 24h


---
### Access statistics
---
* Last Asleep Time [Date]:  
  `Date(sleeplog.awakeSince)`
* Last Awake Duration [ms]:  
  `Date() - sleeplog.awakeSince`
* Last Statistics [object]:
  ```
  // get stats of the last night (period as displayed inside the app)
  //  as this might be the mostly used function the data is cached inside the global object 
  sleeplog.getStats();

  // get stats of the last 24h
  require("sleeplog").getStats(0, 24*60*60*1000);
  // same as
  require("sleeplog").getStats(Date.now(), 24*60*60*1000);
  // output as object, timestamps as UNIX timestamp, durations in minutes
  ={ calculatedAt: 1653123553810, deepSleep: 250, lightSleep: 150, awakeSleep: 10,
    consecSleep: 320, awakeTime: 1030, notWornTime: 0, unknownTime: 0, logDuration: 1440,
    firstDate: 1653036600000, lastDate: 1653111600000 }
  
  // to get the start of a period defined by "Break TOD" of any date
  var startOfBreak = require("sleeplog").getLastBreak();
  // same as
  var startOfBreak = require("sleeplog").getLastBreak(Date.now());
  // output as date
  =Date: Sat May 21 2022 12:00:00 GMT+0200
  
  // get stats of this period as displayed inside the app
  require("sleeplog").getStats(require("sleeplog").getLastBreak(), 24*60*60*1000);
  // or any other day
  require("sleeplog").getStats(require("sleeplog").getLastBreak(Date(2022,4,10)), 24*60*60*1000);
  ```
* Total Statistics [object]:
  ```
  // use with caution, may take a long time !
  require("sleeplog").getStats(0, 0, require("sleeplog").readLog());
  ```


---
### Worth Mentioning
---
#### To do list
* Edit/complete README.md.
* Update screenshots.
* Add more functionallities to interface.html.
* Enable recieving data on the Gadgetbridge side + testing.

#### Requests, Bugs and Feedback
Please leave requests and bug reports by raising an issue at [github.com/storm64/BangleApps](https://github.com/storm64/BangleApps) (or send me a [mail](mailto:banglejs@storm64.de)).

#### Creator
Storm64 ([Mail](mailto:banglejs@storm64.de), [github](https://github.com/storm64))

#### Contributors
myxor ([github](https://github.com/myxor))

#### Attributions
The app icon is downloaded from [https://icons8.com](https://icons8.com).

#### License
[MIT License](LICENSE)

---


Temporarily removed logfiles from metadata.json to prevent removal on un-/reinstall:
```
"data": [
  {"name": "sleeplog.log", "storageFile": true},
  {"wildcard": "sleeplog_????.log"},
  {"wildcard": "sleeplog_??????.csv"}
],
````