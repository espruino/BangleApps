# OpenStreetMap

This app allows you to upload and use OpenSteetMap map tiles onto your
Bangle. There's an uploader, the app, and also a library that
allows you to use the maps in your Bangle.js applications.

## Uploader

Once you've installed OpenStreepMap on your Bangle, find it
in the App Loader and click the Disk icon next to it.

A window will pop up showing what maps you have loaded.

To add a map:

* Click `Add Map`
* Scroll and zoom to the area of interest or use the Search button in the top left
* Now choose the size you want to upload (Small/Medium/etc)
* On Bangle.js 1 you can choose if you want a 3 bits per pixel map (this is lower
quality but uploads faster and takes less space). On Bangle.js 2 you only have a 3bpp
display so can only use 3bpp.
* Click `Get Map`, and a preview will be displayed. If you need to adjust the area you
can change settings, move the map around, and click `Get Map` again.
* When you're ready, click `Upload`

## Bangle.js App

The Bangle.js app allows you to view a map - it also turns the GPS on and marks
the path that you've been travelling.

* Drag on the screen to move the map
* Press the button to bring up a menu, where you can zoom, go to GPS location
or put the map back in its default location

## Library

See the documentation in the library itself for full usage info:
https://github.com/espruino/BangleApps/blob/master/apps/openstmap/openstmap.js

Or check the app itself: https://github.com/espruino/BangleApps/blob/master/apps/openstmap/app.js

But in the most simple form:

```
var m = require("openstmap");
// m.lat/lon are now the center of the loaded map
m.draw(); // draw centered on the middle of the loaded map
```
