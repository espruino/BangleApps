# Run App

This app allows you to display the status of your run.

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

## TODO

* Allow this app to trigger the `Recorder` app on and off directly.
* Keep a log of each run's stats (distance/steps/etc)
