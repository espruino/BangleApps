# Run App

This app allows you to display the status of your run, it
shows distance, time, steps, cadence, pace and more.

To use it, start the app and press the middle button so that
the red `STOP` in the bottom right turns to a green `RUN`.

The separate **Run+** app for Bangle.js 2 provides additional features.

## Display

* `DIST` - the distance travelled based on the GPS (if you have a GPS lock).
  * NOTE: this is based on the GPS coordinates which are not 100% accurate, especially initially. As
  the GPS updates your position as it gets more satellites your position changes and the distance
  shown will increase, even if you are standing still.
* `TIME` - the elapsed time for your run
* `PACE` - the number of minutes it takes you to run a given distance, configured in settings (default 1km) **based on your run so far**
* `HEART (BPM)` - Your current heart rate
* `Max BPM` - Your maximum heart rate reached during the run
* `STEPS` - Steps since you started exercising
* `CADENCE` - Steps per second based on your step rate *over the last minute*
* `GPS` - this is green if you have a GPS lock. GPS is turned on automatically
so if you have no GPS lock you just need to wait.
* The current time is displayed right at the bottom of the screen
* `RUN/STOP` - whether the distance for your run is being displayed or not

## Recording Tracks

When the `Recorder` app is installed, `Run` will automatically start and stop tracks
as needed, prompting you to overwrite or begin a new track if necessary.

## Settings

Under `Settings` -> `App` -> `Run` you can change settings for this app.

* `Record Run` (only displayed if `Recorder` app installed) should the Run app automatically
record GPS/HRM/etc data every time you start a run?
* `Pace` is the distance that pace should be shown over - 1km, 1 mile, 1/2 Marathon or 1 Marathon
* `Boxes` leads to a submenu where you can configure what is shown in each of the 6 boxes on the display.
 Available stats are "Time", "Distance", "Steps", "Heart (BPM)", "Max BPM", "Pace (avg)", "Pace (curr)", "Speed", and "Cadence".
 Any box set to "-" will display no information.
    * Box 1 is the top left (defaults to "Distance")
    * Box 2 is the top right (defaults to "Time")
    * Box 3 is the middle left (defaults to "Pace (avg)")
    * Box 4 is the middle right (defaults to "Heart (BPM)")
    * Box 5 is the bottom left (defaults to "Steps")
    * Box 6 is the bottom right (defaults to "Cadence")
* `Notifications` leads to a submenu where you can configure if the app will notify you after
your distance, steps, or time repeatedly pass your configured thresholds
    * `Ntfy Dist`: The distance that you must pass before you are notified. Follows the `Pace` options
        * "Off" (default), "1km", "1 mile", "1/2 Marathon", "1 Marathon"
    * `Ntfy Steps`: The number of steps that must pass before you are notified.
        * "Off" (default), 100, 500, 1000, 5000, 10000
    * `Ntfy Time`: The amount of time that must pass before you are notified.
        * "Off" (default), "30 sec", "1 min", "2 min", "5 min", "10 min", "30 min", "1 hour"
    * `Dist Pattern`: The vibration pattern to use to notify you about meeting your distance threshold
    * `Step Pattern`: The vibration pattern to use to notify you about meeting your step threshold
    * `Time Pattern`: The vibration pattern to use to notify you about meeting your time threshold

## TODO

* Keep a log of each run's stats (distance/steps/etc)

## Development

This app uses the [`exstats` module](https://github.com/espruino/BangleApps/blob/master/modules/exstats.js). When uploaded via the
app loader, the module is automatically included in the app's source. However
when developing via the IDE the module won't get pulled in by default.

There are some options to fix this easily - please check out the [modules README.md file](https://github.com/espruino/BangleApps/blob/master/modules/README.md)
