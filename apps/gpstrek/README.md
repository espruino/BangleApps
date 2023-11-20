# GPS Trekking

Helper for tracking the status/progress during hiking. Do NOT depend on this for navigation!

This app is inspired by and uses code from "GPS Navigation" and "Navigation compass".

## Usage

Swipe left and right to change between map, info and menu. Swipe up and down in map and info display to change the displayed information.

### Menu
Choose either a route or a waypoint as basis for the display and configure settings to your liking.

### Map
The map shows the loaded route. Current waypoint is a green dot with a circle around it that denotes how close you need to be to autoselect the next waypoint as target.
The map is centered on the currently selected waypoint and the position will be shown relative to the waypoint. If the position is farther away than can be shown on the display the icon turns red and shows the approximate direction on the border of the map.
Secondary map mode is an overview map. Tap the overview to enter scrolling mode and move it around. Tap again to get back to normal function navigation.

### Info
After selecting a target and availability of a GPS fix the compass will show a checkered flag for your destination and a green dot for possibly available waypoints on the way.
Waypoints are shown with name if available and distance to waypoint.

As long as no GPS signal is available the compass shows the heading from the build in magnetometer. When a GPS fix becomes available, the compass display shows the GPS course. This can be differentiated by the display of bubble levels on top and sides of the compass.
If they are on display, the source is the magnetometer and you should keep the bangle level. There is currently no tilt compensation for the compass display.

### Route

The route can be mirrored to switch start and destination.

If the GPS position is close enough to the next waypoint, the route is automatically advanced to the next waypoint.

### Waypoints

You can select a waypoint from the "Waypoints" app as destination.

## Calibration

### Altitude

You can correct the barometric altitude display either by manually setting a known correct value or using the GPS fix elevation as reference. This will only affect the display of altitude values.

### Compass

If the compass fallback starts to show unreliable values, you can reset the calibration in the menu. It starts to show values again after turning 360°.

## Widget

The widget keeps the sensors alive and records some very basic statistics when the app is not started. It shows as the app icon in the widget bar when the background task is active.
This uses a lot of power so ensure to stop the app if you are not actively using it. 

# Creator

[halemmerich](https://github.com/halemmerich)
