# Sleep Log

This app logs and displays the following states:
- sleepling status: _unknown, not worn, awake, light sleep, deep sleep_
- consecutive sleep status: _unknown, not consecutive, consecutive_

It is using the built in movement calculation to decide your sleeping state. While charging it is assumed that you are not wearing the watch and if the status changes to _deep sleep_ the internal heartrate sensor is used to detect if you are wearing the watch.

#### Explanations
* __Detection of Sleep__
  The movement value of bangle's build in health event that is triggered every 10 minutes is checked against the thresholds for light and deep sleep. If the measured movement is lower or equal to the __Deep Sleep__-threshold a deep sleep phase is detected for the last 10 minutes. If the threshold is exceeded but not the __Light Sleep__-threshold than the last timeperiod is detected as light sleep phase. On exceeding even this threshold it is assumed that you were awake.
* __True Sleep__
  The true sleep value is a simple addition of all registered sleeping periods.
* __Consecutive Sleep__
  In addition the consecutive sleep value tries to predict the complete time you were asleep, even the very light sleeping periods when an awake period is detected based on the registered movements. All periods after a sleeping period will be summarized until the first following non sleeping period that is longer then the maximal awake duration (__Max Awake__). If this sum is lower than the minimal consecutive sleep duration (__Min Consecutive__) it is not considered, otherwise it will be added to the consecutive sleep value.

Logfiles are not removed on un-/reinstall to prevent data loss.

| Filename (* _example_)       | Content         | Removeable in     |
|------------------------------|-----------------|-------------------|
| `sleeplog.log (StorageFile)` | recent logfile  | App Web Interface |
| `sleeplog_1234.log`*         | past logfiles   | App Web Interface |
| `sleeplog_123456.csv`*       | debugging files | Web IDE           |


---
### Main App Usage
---

#### Controls:
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

#### View:
| Status      | Color  |    Height |
|-------------|:------:|----------:|
| unknown     | black  |        0% |
| not worn    | red    |       40% |
| awake       | green  |       60% |
| light sleep | cyan   |       80% |
| deep sleep  | blue   |      100% |
| consecutive | violet | as status |


---
### Settings Usage
---

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
    - __Wear Temperature__ | Set the minimum measured temperature of the wearable to consider it being worn. Can be disabled to use the HRM instead to detect if it's being worn.
      __Disabled__ / _20.0°C_ / _20.5°C_ / ... / _40.0°C_
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

- A list of all found logfiles with following options for each file:
  - __view data__
    Display the data to each timestamp in a table.
  - __save csv-file__
    Download a csv-file with the data to each timestamp.
    The time format is chooseable beneath the file list.
  - __delete file__
    Deletes the logfile from the watch. __Please backup your data first!__
- __csv time format__
    __JavaScript (milliseconds since 1970)__ /
    _UNIX (seconds since 1970)_ /
    _Office (days since 1900)_
- __delete all logfiles before__
  Deletes all logfile before the given date from the watch. __Please backup your data first!__

---
### Timestamps and Files
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
### Developer Information
---

#### Access statistics
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

#### Add functions triggered by status changes or inside a specified time period
With the following code it is possible to add functions that will be called every 10 minutes after new movement data when meeting the specified parameters on each :
```
// first ensure that the sleeplog trigger object is available (sleeplog is enabled)
if (typeof (global.sleeplog || {}).trigger === "object") {
  // then add your parameters with the function to call as object into the trigger object
  sleeplog.trigger["my app name"] = {
    onChange: false,   // false as default, if true call fn only on a status change
    from: 0,           // 0 as default, in ms, first time fn will be called
    to: 24*60*60*1000, // 24h as default, in ms, last time fn will be called
      // reference time to from & to is rounded to full minutes
    fn: function(data, thisTriggerEntry) { print(data); } // function to be executed
  };
}
```

The passed __data__ object has the following properties:
- timestamp: of the status change as date object,
    (should be around 10min. before "now", the actual call of the function)
- status: value of the new status (0-4),
    (0 = unknown, 1 = not worn, 2 = awake, 3 = light sleep, 4 = deep sleep)
- consecutive: value of the new status (0-2),
    (0 = unknown, 1 = no consecutive sleep, 2 = consecutive sleep)
- prevStatus: if changed the value of the previous status (0-4) else undefined,
- prevConsecutive: if changed the value of the previous status (0-2) else undefined


If you want to use other variables or functions from the trigger object inside the trigger fn function, you will find them inside the __thisTriggerEntry__ object, as the this keyword is not working in this scenario. The function itself (the fn property) is not passed inside the thisTriggerEntry object.


---
### Worth Mentioning
---
#### To do list
- Optimize interface.html:
  - Open logfile through require("Storage") instead of require("sleeplog").
  - Give feedback how much files have been deleted on "delete all logfiles before".
- Check translations.
- Add more functionallities to interface.html.
- Enable receiving data on the Gadgetbridge side + testing.
  __Help appreciated!__

#### Requests, Bugs and Feedback
Please leave requests and bug reports by raising an issue at [github.com/storm64/BangleApps](https://github.com/storm64/BangleApps) (or send me a [mail](mailto:banglejs@storm64.de)).

#### Creator
Storm64 ([mail](mailto:banglejs@storm64.de), [github](https://github.com/storm64))

#### Contributors
myxor ([github](https://github.com/myxor))

#### Attributions
The app icon is downloaded from [https://icons8.com](https://icons8.com).

#### License
[MIT License](LICENSE)
