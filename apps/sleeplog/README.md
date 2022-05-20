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
    - the .csv file loggs the following data (timestamps are in days since 30.12.1899 as used by office software):  
      _timestamp, movement, status, consecutive, asleepSince, awakeSince, bpm, bpmConfidence_
 - __Timestamps and files:__
   1. externally visible/usable timestamps (in `global.sleeplog`) are formatted as UNIX timestamps:  
     seconds since 1970-01-01 00:00 UTC
   2. internally used and logged (to `sleeplog.log (StorageFile)`) is within the highest available resolution:  
     10 minutes since 1970-01-01 00:00 UTC (`UNIX / (10 * 60 * 1000)`)
   3. debug .csv file ID (`sleeplog_123456.csv`) has a hourly resolution:
     hours since 1970-01-01 00:00 UTC (`UNIX / (60 * 60 * 1000)`)
   4. logged timestamps inside the debug .csv file are formatted for office calculation software:
     days since 1899-12-30 00:00 UTC (`UNIX / (24 * 60 * 60 * 1000) + 25569`)
   5. every 14 days the `sleeplog.log (StorageFile)` is reduced and old entries are moved into separat files for each fortnight (`sleeplog_1234.log`) but still accessible though the app:  
     fortnights since 1970-01-04 12:00 UTC (converted with `require("sleeplog").msToFn(UNIX)` and `require("sleeplog").fnToMs(fortnight)`)
 - __Logfiles from before 0.10:__  
    timestamps and sleeping status of old logfiles are automatically converted on your first consecutive sleep or manually by `require("sleeplog").convertOldLog()`
 - __View logged data:__
    if you'd like to view your logged data in the IDE, you can access it with `require("sleeplog").printLog(since, until)` or `require("sleeplog").readLog(since, until)` to view the raw data  
    since & until in UNIX timestamp, e.g. `require("sleeplog").printLog(Date()-24*60*60*1000, Date())` for the last 24h

---

Temporarily removed logfiles from metadata.json to prevent removal on un-/reinstall:
```
"data": [
  {"name": "sleeplog.log", "storageFile": true},
  {"wildcard": "sleeplog_????.log"},
  {"wildcard": "sleeplog_??????.csv"}
],
````

---
### Worth Mentioning
---
#### To do list
* Edit/complete README.md.
* Update screenshots.
* Add display debugging log functionality.
* Add custom interface.html to view, down- and upload logged data via App Loader.
* Send the logged information to Gadgetbridge.
  ___(For now I have no idea how to achieve this, help is appreciated.)___

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
