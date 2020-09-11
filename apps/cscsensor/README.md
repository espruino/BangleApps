# CSCSensor

Simple app that can read a cycling speed and cadence (CSC) sensor and display the information on the watch.
Currently the app displays the following data:

- moving time
- current speed
- average speed
- maximum speed
- trip distance traveled
- total distance traveled

Button 1 resets all measurements except total distance traveled. The latter gets preserved by being written to storage every 0.1 miles and upon exiting the app.

I do not have access to a cadence sensor at the moment, so only the speed part is currently implemented. Values displayed are imperial or metric (depending on locale),
the wheel circumference can be adjusted in the global settings app.
