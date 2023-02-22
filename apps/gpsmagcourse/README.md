# GPS Compass course switcher
The GPS course and speed is calculated by the difference of positions.
However GPS position is noisy and prone to jump around.
This results in randomly jumping GPS course values when speed is slow or standing still.
So in these cases a user might want to get the moving direction from a compass instead.
This is why this app replaces the GPS course with the compass heading when the speed is slower then 6 km/h (threshold is configurable, see settings).

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
The widget indicates if the current GPS course is provided from GPS or compass.
It can be turned off in the settings.
On Bangle.js 2 a click on the widget does reset the built-in compass.

## Settings
* **Speed threshold**
  - (default = 6 km/h) When GPS speed is lower then this threshold use the compass direction. The speed must be for at least 10 seconds this fast to switch back to GPS course.
* **Compass source**
  - off: Disables this addon.
  - built-in (default): Uses the built-in compass. Its calibration can be restarted by pressing the Widget. When tilt compensation is disabled or "Navigation compass" is not installed the watch must be orientated horizontally for the compass heading to be used.
  - magnav (only if "Navigation Compass" is installed): Compass heading is provided by "Navigation Compass" (magnav). Remember to calibrate it regularly.
* **Reset compass when powered on**
  - Off: Do nothing when compass is turned on.
  - On (default): The calibration of the built-in compass is reset when it is turned on.
* **Tilt compensation on built-in compass**
  Only available if "Navigation Compass" is installed.
  - Off: Leaves the value of the built-in compass unchanged.
  - On (default): Apply the tilt compensation from "Navigation Compass" to the built-in compass in _all_ applications.
* **Show Widget**
  - Never: Widget is hidden.
  - Active (default): Widget is only visible when replacing GPS course with compass heading.
  - GPS on: Widget is shown as soon as GPS is enabled, crossed out when GPS provides the course and displayed normally when the compass heading is used.
