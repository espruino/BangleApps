# Improved pedometer
Pedometer that filters out arm movement and displays a step goal progress.

I changed the step counting algorithm completely.
Now every step is counted when in status 'active', if the time difference between two steps is not too short or too long.
To get in 'active' mode, you have to reach the step threshold before the active timer runs out.
When you reach the step threshold, the steps needed to reach the threshold are counted as well.

## Screenshots
* 600 steps
![](600.png)

* 1600 steps
![](1600.png)

* 10600 steps
![](10600.png)

## Features

* Two line display
* Large number for good readability
* Small number with the exact steps counted
* Large number is displayed in green when status is 'active'
* Progress bar for step goal
* Counts steps only if they are reached in a certain time
* Filters out steps where time between two steps is too long or too short
* Step detection sensitivity from firmware can be configured
* Steps are saved to a file and read-in at start (to not lose step progress)
* Settings can be changed in Settings - App/widget settings - Active Pedometer

## Development version

* https://github.com/Purple-Tentacle/BangleAppsDev/tree/master/apps/pedometer

## Requests

If you have any feature requests, please post in this forum thread: http://forum.espruino.com/conversations/345754/