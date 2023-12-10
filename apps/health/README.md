# Health Tracking

Logs health data to a file in a defined interval, and provides an app to view it

## Usage

Once installed, health data is logged automatically.

To view data, run the `Health` app from your watch.

## Features

Stores:

* Heart rate
* Step count (can calculate distance if myprofile is installed and stride length is set)
* Movement

## Settings

* **Heart Rt** - Whether to monitor heart rate or not
  * **Off** - Don't turn HRM on, but record heart rate if the HRM was turned on by another app/widget
  * **3 Min** - Turn HRM on every 3 minutes (for each heath entry) and turn it off after 1 minute, or when a good reading is found
  * **10 Min** - Turn HRM on every 10 minutes (for each heath entry) and turn it off after 2 minutes, or when a good reading is found
  * **Always** - Keep HRM on all the time (more accurate recording, but reduces battery life to ~36 hours)
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

## TODO

* `interface` page for desktop to allow data to be viewed and exported in common formats
* More features in app:
  * Step counting goal (ensure pedometers use this)
  * Calendar view showing steps per day
  * Yearly view
  * Heart rate 'zone' graph
  * .. other

## License

The graphs on the web interface use Chart.js, licensed under MIT License.
