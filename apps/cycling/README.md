# Cycling
> Displays data from a BLE Cycling Speed and Cadence sensor.

*Fork of the CSCSensor app using the layout library and separate module for CSC functionality*

The following data are displayed:
- curent speed
- moving time
- average speed
- maximum speed
- trip distance
- total distance

Total distance is not stored on the Bangle, but instead is calculated from the CWR (cumulative wheel revolutions) reported by the sensor. This metric is, according to the BLE spec, a absolute value that persists throughout the lifetime of the sensor and never rolls over.

**Cadence / Crank features are currently not implemented**

# TODO
* Settings: imperial/metric
* Store circumference per device address
* Sensor battery status
* Implement crank events / show cadence
* Bangle.js 1 compatibility

# Development
There is a "mock" version of the `blecsc` module, which can be used to test features in the emulator. Check `blecsc-emu.js` for usage.
