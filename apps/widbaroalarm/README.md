# Barometer alarm widget

Get a notification when the pressure reaches defined thresholds.


## Settings
* Interval: check interval of sensor data in minutes. 0 to disable automatic check.
* Low alarm: Toggle low alarm
  * Low threshold: Warn when pressure drops below this value
* High alarm: Toggle high alarm
  * High threshold: Warn when pressure exceeds above this value
* Drop alarm: Warn when pressure drops more than this value in the recent 3 hours (having at least 30 min of data)
    0 to disable this alarm.
* Raise alarm: Warn when pressure raises more than this value in the recent 3 hours (having at least 30 min of data)
    0 to disable this alarm.
* Show widget: Enable/disable widget visibility
* Buzz on alarm: Enable/disable buzzer on alarm
* Dismiss delay: Delay added before the next alert if the alert is dismissed. From 5 to 60 min
* Pause delay: Same as Dismiss delay but longer (usefull for meetings and such). From 30 to 240 min

## Widget
The widget shows the last median pressure value

## Creator
Marco ([myxor](https://github.com/myxor))
