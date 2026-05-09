# Sleep Summary
Provides the module `sleepsummary`, which collects sleep data from `Sleep Log`, and generates a sleep score for you each day, based on average wakeup times, duration and more. The scores will generally trend higher in the first week that you use the module, however, the most accurate scores come the longer you use the module.

The module also comes with an app to see detailed statistics of your sleep compared to your averages prior, and a clock info for quick access to your score.

All data is stored only on your device.


## App
This module provides an app where you can see in-depth details about your sleep. There are two pages:
1. Sleep score and description
2. Detailed stats about all scores, and time asleep and wakeup time.

Swipe left or right to navigate between the two pages.

## Clock Info
This module also provides a clock info for access to your score on the clock face. The clockInfo will show your score of the day, and at midnight, will show `--/100` until a new sleep score comes in when you wake up. When the sleep score for the day is ready, a notification-style bubble will show in the clockinfo image, alerting you that a new score is ready.
   
## Formula

The module takes in the following data points:
- How long you slept compared to your usual sleep time
- Sleep duration compared to ideal duration set in settings
- Deep sleep length compared to ideal deep sleep set in settings
- When you woke up compared to your usual wake up time

The module then averages those individual scores with weights added to get a score out of 100.

## Settings
- <b>Use True Sleep</b> - Whether or not to use True Sleep from sleeplog (deep + light sleep combined). If not checked, uses consecutive sleep instead
- <b>Show Message</b> - Whether or not to show a good morning message / prompt when you wake up (this may not be exactly when you wake up, depending on how accurate your settings for Sleeplog are)
- <b>Ideal Deep Sleep</b> - How much deep sleep per night should qualify as a deep sleep score of 95 (more than this gives you 100)
- <b>Ideal Sleep Time</b> - How much sleep per night should qualify as a sleep duration score of 95 (more than this gives you 100)
- <b>Min Consec Sleep</b> - The minimum consecutive sleep (in minutes) required before the module considers you to have properly woken up
- <b>Message Delay</b> - How long after waking the module waits to confirm you are actually awake before showing the prompt

## Development
To use the module, do `require("sleepsummary")` followed by any function from the list below.

- `require("sleepsummary").recordData();` - Records current sleep data into the rolling averages, then recalculates and caches today's scores. It is best to only do this once a day, and is already automatically handled by the module.

- `require("sleepsummary").getSummaryData();` - Returns the following:
  - `avgSleepTime` - The average time you sleep for, in **minutes**
  - `totalCycles` - How many sleep cycles to date the module has tracked
  - `avgWakeUpTime` - The average time you wake up, in **ms past midnight**
  - `dateLastRecorded` - A datetime string of when the module last recorded sleep information (`YYYY-MM-DD HH:MM:SS`)
  - `scoreLastUpdated` - A date string (`YYYY-MM-DD`) of the last day a score was calculated and shown
  - `wakeUpTime` - Today's wake-up time, in **ms past midnight**
  - `overallSleepScore` - Today's cached overall sleep score (0–100)
  - `deepSleepScore` - Today's cached deep sleep score (0–100)
  - `wkUpSleepScore` - Today's cached wake-up consistency score (0–100)
  - `durationSleepScore` - Today's cached sleep duration score (0–100)
  - `consecSleep` - Today's consecutive sleep, in **minutes**
  - `trueSleep` - Today's true sleep (deep + light), in **minutes**
  - `sleepDuration` - Today's sleep duration in **minutes**, using either true sleep or consecutive sleep depending on the Use True Sleep setting

  **Note:** *If needed, pass `true` to force a recalculation before getting the data: `require("sleepsummary").getSummaryData(true);`*
    
- `require("sleepsummary").getSleepData();` - Returns the following about this night's sleep (most data comes directly from `require("sleeplog").getStats(Date.now(), 24*60*60*1000)`):
  - `calculatedAt` - When the data was calculated
  - `deepSleep` - Time spent in deep sleep, in **minutes**
  - `lightSleep` - Time spent in light sleep, in **minutes**
  - `awakeSleep` - Time spent awake during sleep periods, in **minutes**
  - `consecSleep` - Consecutive sleep duration, in **minutes**
  - `trueSleep` - True sleep (deep + light), in **minutes**
  - `totalSleep` - Total sleep in **minutes**, using consecutive or true sleep depending on the Use True Sleep setting
  - `awakeTime` - Time spent awake
  - `notWornTime` - Time the watch was detected as not worn
  - `unknownTime` - Time spent in an unknown state
  - `logDuration` - Total time spent logging
  - `firstDate` - Unix timestamp of the first log entry in the stats
  - `lastDate` - Unix timestamp of the last log entry in the stats
  - `awakeSince` - Wake-up time in **ms past midnight**
     
- `require("sleepsummary").getSleepScores();` - Returns the following sleep scores for today:
  - `durationScore` - Sleep duration compared to ideal duration set in settings
  - `deepSleepScore` - Deep sleep length compared to ideal deep sleep set in settings
  - `avgWakeUpScore` - Wake-up time compared to your average (0 if no average recorded yet)
  - `avgSleepTimeScore` - Sleep duration compared to your average (0 if no average recorded yet)
  - `overallScore` - The overall sleep score, calculated as a weighted average of all the other scores

- `require("sleepsummary").deleteData();` - Deletes all learned averages and cached scores. The module will automatically relearn the next time `recordData()` is called.


## Creator
RKBoss6