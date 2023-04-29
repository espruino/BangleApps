# Power manager

Manages settings for charging.
Features:
* Warning threshold to be able to disconnect the charger at a given percentage
* Set the battery calibration offset
* Force monotonic battery percentage or voltage
* Automatic calibration on charging uninterrupted longer than 3 hours (reloads of the watch reset the timer).


## Widget

The widget shows an approximate current power use. There is a power gauge showing the estimation of the currently used power and the currently active sensor with the biggest power draw.
G for GPS, H for pulse sensor and C for compass.

## Logging

You can switch on logging in the options to diagnose unexpected power use. Currently the logging can capture the code running from timeouts and intervals and the power up and down of some devices. The captured times are probably not perfect but should be good enough to indicate problems.

Do not use trace logging for extended time, it uses a lot of storage and can fill up the flash quite quick.

### TODO

* Wrap functions given as strings to setTimeout/setInterval
* Handle eval in setTimeout/setInterval
* Track functions executed as event handlers
* Track buzzer
* Modify browser interface to estimate power use like widget does

## Internals

Battery calibration offset is set by writing `batFullVoltage` in setting.json 

## TODO

* Optionally keep battery history and show as graph
* Capture some more stuff in logging
 * Event driven code execution
 * Buzzer
 * Better tracking of display on time

## Creator

[halemmerich](https://github.com/halemmerich)
