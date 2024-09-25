# Cycling

> Displays data from a BLE Cycling Speed and Cadence sensor.

*This is a fork of the CSCSensor app using the layout library and separate module for CSC functionality. It also drops persistence of total distance on the Bangle, as this information is also persisted on the sensor itself. Further, it allows configuration of display units (metric/imperial) independent of chosen locale. Finally, multiple sensors can be used and wheel circumference can be configured for each sensor individually.*

The following data are displayed:
- curent speed
- moving time
- average speed
- maximum speed
- trip distance
- total distance

Other than in the original version of the app, total distance is not stored on the Bangle, but instead is calculated from the CWR (cumulative wheel revolutions) reported by the sensor. This metric is, according to the BLE spec, an absolute value that persists throughout the lifetime of the sensor and never rolls over.

**Cadence / Crank features are currently not implemented**

## Usage
Open the app and connect to a CSC sensor.

Upon first connection, close the app afain and enter the settings app to configure the wheel circumference. The total circumference is (cm + mm) - it is split up into two values for ease of configuration. Check the status screen inside the Cycling app while connected to see the address of the currently connected sensor (if you need to differentiate between multiple sensors).

Inside the Cycling app, use button / tap screen to:
- cycle through screens (if connected)
- reconnect (if connection aborted)

## TODO
* Sensor battery status
* Implement crank events / show cadence
* Allow setting CWR on the sensor (this is a feature intended by the BLE CSC spec, in case the sensor is replaced or transferred to a different bike)

