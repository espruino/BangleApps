# Chronometer Widget

Chronometer (timer) that runs as a widget.
The advantage is, that you can still see your normal watchface and other widgets when the timer is running.
The widget is always active, but only shown when the timer is on.
Hours, minutes, seconds and timer status can be set with an app.

When there is less than one second left on the timer it buzzes.

The widget has been tested on Bangle 1 and Bangle 2

## Screenshots

![](screenshot.png)


## Features

* Using other apps does not interrupt the timer, no need to keep the widget open (BUT: there will be no buzz when the time is up, for that the widget has to be loaded)
* Target time is saved to a file and timer picks up again when widget is loaded again.

## Settings

There are no settings section in the settings app, timer can be set using an app.

* Reset values: Reset hours, minutes, seconds to 0; set timer on to false; write to settings file
* Hours: Set the hours for the timer
* Minutes: Set the minutes for the timer
* Seconds: Set the seconds for the timer
* Timer on: Starts the timer and displays the widget when set to 'On'. You have to leave the app to load the widget which starts the timer. The widget is always there, but only visible when timer is on.


## Releases

* Official app loader: https://github.com/espruino/BangleApps/tree/master/apps/chronowid (https://banglejs.com/apps/)
* Forked app loader: https://github.com/Purple-Tentacle/BangleApps/tree/master/apps/chronowid (https://purple-tentacle.github.io/BangleApps/index.html#)
* Development: https://github.com/Purple-Tentacle/BangleAppsDev/tree/master/apps/chronowid

## Requests

If you have any feature requests, please write here: http://forum.espruino.com/conversations/345972/
