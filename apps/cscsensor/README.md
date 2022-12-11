# CSCSensor

Simple app that can read a cycling speed and cadence (CSC) sensor and display the information on the watch.
Currently the app displays the following data:

- moving time
- current speed
- average speed
- maximum speed
- trip distance traveled
- total distance traveled
- an icon with the battery status of the remote sensor

Button 1 (swipe up on Bangle.js 2) resets all measurements except total distance traveled. The latter gets preserved by being written to storage every 0.1 miles and upon exiting the app.
If the watch app has not received an update from the sensor for at least 10 seconds, pushing button 3 (swipe down on Bangle.js 2) will attempt to reconnect to the sensor.
Button 2 (tap on Bangle.js 2) switches between the display for cycling speed and cadence.

Values displayed are imperial or metric (depending on locale), cadence is in RPM, the wheel circumference can be adjusted in the global settings app.

# TODO

* Use Layout Library to provide proper Bangle.js 2 support
* Turn CSC sensor support into a library
* Support for `Recorder` app, to allow CSC readings to be logged alongside GPS
