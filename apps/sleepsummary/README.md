# Sleep Summary
This provides the module `sleepsummary`, which collects sleep data from `Sleep Log`, and generates a sleep score for you, based on average wakeup times, duration and more. The scores will generally trend higher in the first week that you use the module, however, the most accurate scores come the longer you use the module.

The module also comes with an app to see detailed statistics of your sleep compared to your averages prior.
All data is stored only on your device.

It is highly reccomended to use HRM with `sleeplog` for increased accuracy in sleep tracking, leading to a more accurate sleep score here. To enable this, turn on HRM intervals in the `Health` app.
## App
This module provides an app where you can see in-depth details about your sleep. There are two pages:
1. Sleep score and description
2. Detailed stats about all scores, and time asleep and wakeup time.
   
## Formula

The module takes in several data points:
- How long you slept compared to your average
- Duration compared to ideal duration set in settings
- Deep sleep length compared to ideal deep sleep set in settings
- When you woke up compared to your average

The module then averages those individual scores with a weight added to get a score out of 100.
## Settings
- <b>Use True Sleep</b> - Whether or not to use True Sleep from sleeplog. If not checked, uses consecutive sleep instead
- <b>Show Message</b> - Whether or not to show a good morning message / prompt when you wake up (this may not be exactly when you wake up, depending on how accurate your settings for Sleeplog are)
- <b>Ideal Deep Sleep</b> - How much deep sleep per night should qualify as a deep sleep score of 95 (more than this gives you 100)
- <b>Ideal Sleep Time</b> - How much sleep per night should qualify as a sleep duration score of 95 (more than this gives you 100)

## Development
To use the module, do `require("sleepsummary")` followed by any function from the list below.

- `require("sleepsummary").recordData();` - Records current sleep data for the averages. It is best to only do this once a day, and is already automatically handled by the module.
  
- `require("sleepsummary").getSummaryData();` - Returns the following:
  - `avgSleepTime` - The average time you sleep for, returned in minutes
  - `totalCycles` - How many times that the average was calculated / recorded
  - `avgWakeUpTime` - The average time you wake up at every day, returned in ms (milliseconds) past midnight
  - `promptLastShownDay` - The day of the week that the good morning prompt was last shown (0-6). This is only used by the boot.js file as a way to know if it needs to show the prompt today
    
-  `require("sleepsummary").getSleepData();` - Returns the following about this night's sleep (Most of the data comes directly from `require("sleeplog").getStats(Date.now(), 24*60*60*1000)`:
   - `calculatedAt` - When the data was calculated
   - `deepSleep` - How long in minutes you spent in deep sleep
   - `lightSleep` - How long in minutes you spent in light sleep
   - `awakeSleep` - How long you spent awake during sleep periods
   - `consecSleep` - How long in minutes your consecutive sleep is
   - `awakeTime` -  How long you are awake for
   - `notWornTime` - How long the watch was detected as not worn
   - `unknownTime` - Time spent unknown
   - `logDuration` - Time spent logging
   - `firstDate` - Unix timestamp of the first log entry in the stats
   - `lastDate`: Unix timestamp of the last log entry in the stats
   - `totalSleep`: Total minutes of sleep for this night using consecutive sleep or true sleep, depending on what's selected in settings
   - `awakeSince` - Time you woke up at, in ms past midnight
     
 - `require("sleepsummary").getSleepScores();` - Returns the following sleep scores:
   - `durationScore` - Sleep duration compared to ideal duration set in settings.
   - `deepSleepScore` - Deep sleep length compared to ideal deep sleep set in settings
   - `avgWakeUpScore` - When you woke up compared to your average
   - `avgSleepTimeScore` - How long you slept compared to your average
   - `overallScore` - The overall sleep score, calculated as a weighted average of all the other scores
     
 - `require("sleepsummary").deleteData();` - Deletes learned data, automatically relearns the next time `recordData()` is called.


## Creator
RKBoss6
