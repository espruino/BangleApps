# Sleep Log

This app logs and displays the following states:  
- sleepling status: _unknown, not worn, awake, light sleep, deep sleep_
- consecutive sleep status: _unknown, not consecutive, consecutive_

It is using the built in movement calculation to decide your sleeping state. While charging it is assumed that you are not wearing the watch and if the status changes to _deep sleep_ the internal heartrate sensor is used to detect if you are wearing the watch.

Logfiles are not removed on un-/reinstall to prevent data loss.

| Filename (* _example_)       | Content         | Removeable in     |
|------------------------------|-----------------|-------------------|
| `sleeplog.log (StorageFile)` | recent logfile  | App Web Interface |
| `sleeplog_1234.log`*         | old logfiles    | App Web Interface |
| `sleeplog_123456.csv`*       | debugging files | Web IDE           |


---
### App Usage
---

#### On the main app screen:
  - __swipe left & right__  
    to change the displayed day
  - __touch the "title"__ (e.g. `Night to Fri 20/05/2022`)  
    to enter day selection prompt
  - __touch the info area__  
    to change the displayed information  
    (by default: consecutive & true sleeping)
  - __touch the wrench__ (upper right corner)  
    to enter the settings
  - __use back button widget__ (upper left corner)  
    exit the app

#### Inside the settings:
  - __Thresholds__ submenu  
    Changes take effect from now on, not retrospective!
    - __Max Awake__ | maximal awake duration  
      _10min_ / _20min_ / ... / __60min__ / ... / _120min_
    - __Min Consecutive__ | minimal consecutive sleep duration  
      _10min_ / _20min_ / ... / __30min__ / ... / _120min_
    - __Deep Sleep__ | deep sleep threshold  
      _30_ / _31_ / ... / __100__ / ... / _200_
    - __Light Sleep__ | light sleep threshold  
      _100_ / _110_ / ... / __200__ / ... / _400_  
    - __Reset to Default__ | reset to bold values above
  - __BreakToD__ | time of day to break view  
    _0:00_ / _1:00_ / ... / __12:00__ / ... / _23:00_
  - __App Timeout__ | app specific lock timeout  
    __0s__ / _10s_ / ... / _120s_
  - __Enabled__ | completely en-/disables the background service  
    __on__ / _off_
  - __Debugging__ submenu  
    - __View log__ | display logfile data  
      Select the logfile by its starting time.  
      Thresholds are shown as line with its value.  
      - __swipe left & right__  
        to change displayed duration
      - __swipe up & down__  
        to change displayed value range
      - __touch the graph__  
        to change between light & dark colors
      - __use back button widget__ (upper left corner)  
        to go back to the logfile selection
    - __Enabled__ | en-/disables debugging  
      _on_ / __off__
    - __write File__ | toggles if a logfile is written  
      _on_ / __off__
    - __Duration__ | duration for writing into logfile  
      _1h_ / _2h_ / ... / __12h__ / _96_  
    - The following data is logged to a csv-file:    
      _timestamp_ (in days since 1900-01-01 00:00 UTC used by office software) _, movement, status, consecutive, asleepSince, awakeSince, bpm, bpmConfidence_


---
### Web Interface Usage
---

Available through the App Loader when your watch is connected.

- __view data__  
  Display the data to each timestamp in a table.
- __save csv-file__  
  Download a csv-file with the data to each timestamp.  
  The time format is chooseable beneath the file list. 
- __delete file__  
  Deletes the logfile from the watch. __Please backup your data first!__

---
### Timestamps and files
---

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
### Access statistics (developer information)
---
- Last Asleep Time [Date]:  
  `Date(sleeplog.awakeSince)`
- Last Awake Duration [ms]:  
  `Date() - sleeplog.awakeSince`
- Last Statistics [object]:  
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
- Total Statistics [object]:  
  ```
  // use with caution, may take a long time !
  require("sleeplog").getStats(0, 0, require("sleeplog").readLog());
  ```


---
### Worth Mentioning
---
#### To do list
- Check translations.
- Add more functionallities to interface.html.
- Enable recieving data on the Gadgetbridge side + testing.  
  __Help appreciated!__

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
