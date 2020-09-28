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

Button 1 resets all measurements except total distance traveled. The latter gets preserved by being written to storage every 0.1 miles and upon exiting the app.
If the watch app has not received an update from the sensor for at least 10 seconds, pushing button 3 will attempt to reconnect to the sensor.

I do not have access to a cadence sensor at the moment, so only the speed part is currently implemented. Values displayed are imperial or metric (depending on locale),
the wheel circumference can be adjusted in the global settings app.
