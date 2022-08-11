# GPS Power Status Widget

A simple widget that shows the on/off and fix status of the GPS.

The GPS can quickly run the battery down if it is on all the time so
it is useful to know if it has been switched on or not.

- Uses Bangle.isGPSOn()

There are two icons which can be used to visualize the GPS/GNSS status:
1. A cross colored depending on the GPS/GNSS status
    - Shows in grey when the GPS is off
    - Shows in amber when the GPS is on but has no fix
    - Shows in green when the GPS is on and has a fix
2. Different place markers depending on GPS/GNSS status

You can also choose to hide the icon when the GPS is off in the settings.
    
Written by: [Hugh Barney](https://github.com/hughbarney) For support
and discussion please post in the [Bangle JS
Forum](http://forum.espruino.com/microcosms/1424/)

Extended by Marco ([myxor](https://github.com/myxor))

Extended by khromov ([khromov](https://github.com/khromov))

Place marker icons from [icons8.com](https://icons8.com/icon/set/maps/material-outlined).
