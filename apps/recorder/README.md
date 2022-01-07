# Recorder

![icon](app.png)

This app allows you to record data every few seconds - it can run in background.

Usually you'd record GPS (but this is not required). The data can later be exported as CSV, KML or GPX files via the Download button in the Bangle.js App Store entry for Recorder.

## Usage

First run the `Recorder` app, here you can configure what you want to record, how often,
and you can start and stop recordings.

You can record

* **Time** The current time
* **GPS** GPS Latitude, Longitude and Altitude
* **Steps** Steps counted by the step counter
* **HR** Heart rate and confidence
* **BAT** Battery percentage and voltage
* **Core** CoreTemp body temperature

**Note:** It is possible for other apps to record information using this app
as well. They need to define a `foobar.recorder.js` file - see the `getRecorders`
function in `widget.js` for more information.

## Tips

When recording GPS, it usually takes several minutes for the watch to get a [GPS fix](https://en.wikipedia.org/wiki/Time_to_first_fix). There is a red satellite symbol, which you will see turn green when you get an actual GPS Fix. You can [upload assistant files](https://banglejs.com/apps/#assisted%20gps%20update) to speed up the time spent on getting a GPS fix.
