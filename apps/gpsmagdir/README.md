# GPS Compass heading switcher
The GPS course and speed is calculated by the difference of positions.
However GPS position is noisy and prone to jump around.
This results in randomly jumping GPS course values when speed is slow or standing still.
So in these cases a user might want to get his moving direction from a compass instead.
This is why this app replaces the GPS heading with the compass heading when the speed is slower then 6 km/h (threshold is configurable, see settings).

## Important Notes
* **Watch orientation**
  When the GPS is calculating the course the orientation of the watch does not matter.
  When the Compass is used as the source of the current heading its top must obviously point at the moving direction (Usually away from you).
* **Tilt compensation**
  When "Navigation Compass" is installed the built-in compass gets automatic tilt compensation. This can be turned off in settings. Without "Navigation Compass" installed or this feature disabled the watch must be orientated with the display up to provide a useable compass value.
* **Compass reset and calibration**
  When using "Navigation Compass" as compass source (see settings) please remember to calibrate it regularly.
  With this app installed the built-in compass calibration is automatically reset when the compass is turned on (deactivatable in settings). It can also be reset with a tap on the Widget (Bangle.js 2 only). Please note that directly after a reset the built-in compass must be turned 360 degrees to provide a useable value.
* **True north vs magnetic north**
  Please note that the compass does not point to the "real north" but depending on your location there is an offset, see [Magnetic declination](https://en.wikipedia.org/wiki/Magnetic_declination)
  However the error from local magnetic interference and from calibration will probably be higher..

## Widget
The widget indicates if the current GPS heading is provided from GPS or compass.
It can be turned off in the settings.
On Bangle.js 2 a click on the widget does reset the built-in compass.

## Settings
* **speed**
  - (default = 6 km/h) When lower then this use direction from compass
* **compassSrc**
  - off:
  - built-in (default):
  - Navigation Compass:
* **reset compass on power on**
  - off:
  - on (default):
* **tilt compensation**
  - off:
  - on (default):
* **show Widget**
  - Never
  - Active (default): When replacing GPS course with compass course
  - GPS on

## TODO:
- Add Settings
- Document settings with defaults
- Check magnav dependency in settings
- note magnav silently downgrade
- Test on BangleJS
