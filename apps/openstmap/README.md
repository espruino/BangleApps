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
quality, but uploads faster and takes less space). Bangle.js 2 is limited to 3bpp.
* Click `Get Map`, and a preview will be displayed. If you need to adjust the area you
can change settings, move the map around, and click `Get Map` again.
* When you're ready, click `Upload`

**Note:** By default on Bangle.js, pre-dithered 3 bpp bitmaps will be uploaded
(which match the screen bit depth). However you can untick the `3 bit` checkbox
to use 8 bit maps, which take up 2.6x more space but look much better when
zoomed in/out.

## Bangle.js App

The Bangle.js app allows you to view a map. It also turns the GPS on
and marks the path that you've been travelling (if enabled), and
displays waypoints in the watch (if dependencies exist).

* Drag on the screen to move the map
* Click bottom left to zoom in, bottom right to zoom out
* Press the button to bring up a menu, where you can zoom, go to GPS location,
put the map back in its default location, or choose whether to draw the currently
recording GPS track (from the `Recorder` app).

**Note:** If enabled, drawing the currently recorded GPS track can take a second
or two (which happens after you've finished scrolling the screen with your finger).


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
