# Run App

This app allows you to display the status of your run, it
shows distance, time, steps, cadence, pace and more.

To use it, start the app and press the middle button so that
the red `STOP` in the bottom right turns to a green `RUN`.

## Display

* `DIST` - the distance travelled based on the GPS (if you have a GPS lock).
  * NOTE: this is based on the GPS coordinates which are not 100% accurate, especially initially. As
  the GPS updates your position as it gets more satellites your position changes and the distance
  shown will increase, even if you are standing still.
* `TIME` - the elapsed time for your run
* `PACE` - the number of minutes it takes you to run a kilometer **based on your run so far**
* `HEART` - Your heart rate
* `STEPS` - Steps since you started exercising
* `CADENCE` - Steps per second based on your step rate *over the last minute*
* `GPS` - this is green if you have a GPS lock. GPS is turned on automatically
so if you have no GPS lock you just need to wait.
* The current time is displayed right at the bottom of the screen
* `RUN/STOP` - whether the distance for your run is being displayed or not

## Recording Tracks

`Run` doesn't directly allow you to record your tracks at the moment.
However you can just install the `Recorder` app, turn recording on in
that, and then start the `Run` app.

## Settings

Under `Settings` -> `App` -> `Run` you can change settings for this app.

* `Record Run` (only displayed if `Recorder` app installed) should the Run app automatically
record GPS/HRM/etc data every time you start a run?
* `Pace` is the distance that pace should be shown over - 1km, 1 mile, 1/2 Marathon or 1 Marathon
* `Box 1/2/3/4/5/6` are what should be shown in each of the 6 boxes on the display. From the top left, down.
  If you set it to `-` nothing will be displayed, so you can display only 4 boxes of information
  if you wish by setting the last 2 boxes to `-`.

## TODO

* Allow this app to trigger the `Recorder` app on and off directly.
* Keep a log of each run's stats (distance/steps/etc)

## Development

This app uses the [`exstats` module](/modules/exstats.js). When uploaded via the
app loader, the module is automatically included in the app's source. However
when developing via the IDE the module won't get pulled in by default.

There are some options to fix this easily - please check out the [modules README.md file](/modules/README.md)
