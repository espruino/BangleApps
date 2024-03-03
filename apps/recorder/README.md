**# Recorder

![icon](app.png)

This app allows you to record data every few seconds - it can run in background.

Usually you'd record GPS (but this is not required). The data can later be exported as CSV, KML or GPX files via the Download button in the Bangle.js App Store entry for Recorder.

## Usage

First run the `Recorder` app, here you can configure what you want to record, how often,
and you can start and stop recordings.

You can record

* **Time** The current time
* **GPS** GPS Latitude, Longitude and Altitude
* **HR** Heart rate and confidence
* **BAT** Battery percentage and voltage
* **Steps** Steps counted by the step counter
* **Baro** (Bangle.js 2) Using the built-in barometer to record Temperature, Pressure and Altitude
* **Core** CoreTemp body temperature *if* you have a CoreTemp device and the https://banglejs.com/apps/?id=coretemp app installed

You can then start/stop recording from the Recorder app itself (and as long as widgets are
enabled in the app you're using, you can move to another app and continue recording).
Some apps like the [Run app](https://banglejs.com/apps/?id=run) are able to automatically start/stop the Recorder too.

**Note:** It is possible for other apps to record information using this app
as well. They need to define a `foobar.recorder.js` file - see the `getRecorders`
function in `widget.js` for more information.

## Graphing

You can download the information to the PC using [the App Loader](https://banglejs.com/apps/?id=recorder). Connect
to your Bangle, then in `My Apps` click the disk icon next to the `Recorder` app to download data.

You can also view some information on the watch.

* Tap `View Tracks`
* Tap on the Track number you're interested in, and you'll see a page with information about that track...
  * `Plot Map` plots a map using GPS coordinates
  * `Plot OpenStMap` plots a map using GPS coordinates on top of an OpenStreetMap map (if the app is installed)
  * `Plot Alt` plots altitude over time
  * `Plot Speed` plots speed over time
  * `Plot HRM` plots heart rate over time

## Usage in code

As long as widgets are loaded, you can:

* Call `WIDGETS["recorder"].setRecording(true)` to start recording (it returns a promise, and may show a menu)
* Call `WIDGETS["recorder"].setRecording(true, {force:"new"/"append"/"overwrite")` to start recording (it returns a promise, and will not show a menu)
* Call `WIDGETS["recorder"].setRecording(false)` to stop recording



## Tips

When recording GPS, it usually takes several minutes for the watch to get a [GPS fix](https://en.wikipedia.org/wiki/Time_to_first_fix). There is a red satellite symbol, which you will see turn green when you get an actual GPS Fix. You can [upload assistant files](https://banglejs.com/apps/#assisted%20gps%20update) to speed up the time spent on getting a GPS fix.
