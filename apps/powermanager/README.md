# Power manager

Manages settings for charging.
Features:
* Warning threshold to be able to disconnect the charger at a given percentage
* Set the battery calibration offset
* Force monotonic battery percentage or voltage
* Automatic calibration on charging uninterrupted longer than 3 hours (reloads of the watch reset the timer).

## Internals

Battery calibration offset is set by writing `batFullVoltage` in setting.json 

## TODO

* Optionally keep battery history and show as graph

## Creator

[halemmerich](https://github.com/halemmerich)
