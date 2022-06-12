# Hanks World Clock - See the time in four locations

In addition to the main clock and date in your current location, you can add up to three other locations. Great for travel or remote working.
Additionally we show the sunset/sunrise and seconds for the current location and the day name is shown in your locale.
If watch is locked, seconds get refreshed every 10 seconds.

![](hworldclock.png)

## Usage

Provide names and the UTC offsets for up to three other timezones in the app store. These are stored in a json file on your watch. UTC offsets can be decimal (e.g., 5.5 for India). 

The clock does not handle summer time / daylight saving time changes automatically. If one of your three locations changes its UTC offset, you can simply change the setting in the app store and update. Currently the clock only supports 24 hour time format for the additional time zones.


## Requests

Please use [the Espruino Forum](http://forum.espruino.com/microcosms/1424/) if you have feature requests or notice bugs.

## Creator

Created by Hank.

Based on the great work of
=================
World Clock - 4 time zones
Made by [Scott Hale](https://www.github.com/computermacgyver), based upon the [Simple Clock](https://github.com/espruino/BangleApps/tree/master/apps/sclock).
===== a n d =====
Sun Clock
[Sun Clock](https://github.com/espruino/BangleApps/tree/master/apps/sunclock)
=================
