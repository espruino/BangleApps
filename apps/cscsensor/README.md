# CSCSensor

Simple app that can read a cycling speed and cadence (CSC) sensor and display the information on the watch.
Currently the app displays the following data:

- moving time
- current speed
- average speed
- maximum speed
- distance traveled

Button 1 resets all measurements.

I do not have acces to a cadence sensor at the moment, so only the speed part is currently implemented. Values displayed are imperial or metric (depending on locale),
and a wheel diameter of 28 inches is assumed. A settings dialog to configure wheel sizes will (hopefully) be added later.
