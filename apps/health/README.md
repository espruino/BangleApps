# Health Tracking

Logs health data to a file in a defined interval, and provides an app to view it

## Usage

Once installed, health data is logged automatically. Entries are stored with a 10 minute interval.

To view data, run the `Health` app from your watch.

## Features

Stores:

* Heart rate
* Step count (can calculate distance if myprofile is installed and stride length is set)
* Movement

## Settings

* **Heart Interval** - Whether to monitor heart rate or not
  * **Off** - Don't turn HRM on, but record heart rate if the HRM was turned on by another app/widget
  * **3 Min** - Turn HRM on every 3 minutes (for each heath entry) and turn it off after 1 minute, or when a good reading is found
  * **10 Min** - Turn HRM on every 10 minutes (for each heath entry) and turn it off after 2 minutes, or when a good reading is found
  * **Always** - Keep HRM on all the time (more accurate recording, but reduces battery life to ~36 hours)
* **HRM Stop Delay** - Default None. Adds a delay (in seconds) before turning the heart rate monitor off after a good reading is found. The initial reading at 90% confidence can sometimes be inaccurate. Adding a 10-30 second delay allows the sensor to settle and may provide a more accurate heart rate value.
* **Wear Check** - Defaults to 'Movement'. Determines how the watch checks if it is being worn before turning on the heart rate monitor (to save battery).
  * **Movement** - Uses accelerometer data (Z-axis orientation and last movement reading) to check if the watch is hardly moved and if the watch faces up.
  * **Temperature (e.g., 25.0°C)** - Uses the internal temperature sensor. If the watch is warmer than this value (due to body heat), it assumes it is worn. This may give more accurate results for sleep tracking, as lying perfectly still in bed can falsely trigger the "Movement" check and prevent nighttime HRM readings.
* **Daily Step Goal** - Default 10000, daily step goal for pedometer apps to use and for the step goal notification
* **Step Goal Notification** - True if you want a notification when the daily step goal is reached


## Technical Info

Once installed, the `health.boot.js` hooks onto the `Bangle.health` event and
writes data to a binary file (one per month).

A library (that can be used with `require("health").readXYZ` can then be used
to grab historical health info.

`boot.js` and `lib.js` include some constants that don't get inlined by the simple
minifier used in the App Loader, so we use the closure compiler to pre-minify them.
The easiest way to use it is to install `https://github.com/espruino/EspruinoDocs`
and run `EspruinoDocs/bin/minify.js lib.js lib.min.js`

HRM data is stored as a number representing the best/average value from a 10 minute period.

## Usage in code

You can read a day's worth of health data using readDay, which will call the callback with each data packet:

```JS
require("health").readDay(new Date(), print)
// ... for each 10 min packet:
{ "steps": 40, "bpmMin": 92, "bpmMax": 95, "movement": 488,
  "battery": 51, "isCharging": false, "temperature": 25.5, "altitude": 79,
  "activity": "UNKNOWN",
  "bpm": 93.5, "hr": 6, "min": 50 }
```

Other functions are available too, and they all take a `Date` as an argument:

```JS
// Read all records from the given month
require("health").readAllRecords(d, cb)

// Read the entire database. There is no guarantee that the months are read in order.
require("health").readFullDatabase(cb)

// Read all records per day, until the current time.
// There may be some records for the day of the timestamp previous to the timestamp
require("health").readAllRecordsSince(d, cb)

// Read daily summaries from the given month
require("health").readDailySummaries(d, cb)

// Read all records from the given day
require("health").readDay(d, cb)
```


## TODO

* More features in app:
  * Viewing stored altitude/bpm min/max graphs
  * Currently we only graph per hour but we have 10 min data - should it be shown?
  * Pie chart to show percent of time in each activity
  * Calendar view showing steps per day
  * Yearly view
  * Heart rate 'zone' graph
  * .. other

## License

The graphs on the web interface use Chart.js, licensed under MIT License.
