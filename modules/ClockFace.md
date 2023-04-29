ClockFace
=========

This module handles most of the tasks needed to set up a clock, so you can
concentrate on drawing the time.

Example
-------
Tthe [tutorial clock](https://www.espruino.com/Bangle.js+Clock) converted to use
this module:

```js

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// position on screen
const X = 160, Y = 140;

var ClockFace = require("ClockFace");
var clock = new ClockFace({
  precision: 1, // update every second
  draw: function(d) {
    // work out how to display the current time
    var h = d.getHours(), m = d.getMinutes();
    var time = (" "+h).substr(-2)+":"+("0"+m).substr(-2);
    // draw the current time (4x size 7 segment)
    g.setFont("7x11Numeric7Seg", 4);
    g.setFontAlign(1, 1); // align right bottom
    g.drawString(time, X, Y, true /*clear background*/);
    // draw the seconds (2x size 7 segment)
    g.setFont("7x11Numeric7Seg", 2);
    g.drawString(("0"+d.getSeconds()).substr(-2), X+30, Y, true /*clear background*/);
    // draw the date, in a normal font
    g.setFont("6x8");
    g.setFontAlign(0, 1); // align center bottom
    // pad the date - this clears the background if the date were to change length
    var dateStr = "    "+require("locale").date(d)+"    ";
    g.drawString(dateStr, g.getWidth()/2, Y+15, true /*clear background*/);
  }
});
clock.start();

```



Complete Usage
--------------

```js

var ClockFace = require("ClockFace");
var clock = new ClockFace({
    precision: 1,   // optional, defaults to 60: how often to call update(), in seconds
    init: function() {    // optional
      // called only once before starting the clock, but after setting up the 
      // screen/widgets, so you can use Bangle.appRect 
    },
    draw: function(time, changed) {   // at least draw or update is required
      // (re)draw entire clockface, time is a Date object
      // `changed` is the same format as for update() below, but always all true
      // You can use `this.is12Hour` to test if the 'Time Format' setting is set to "12h" or "24h"
    },
    // The difference between draw() and update() is that the screen is cleared
    // before draw() is called, so it needs to always redraw the entire clock
    update: function(time, changed) {   // at least draw or update is required
      // redraw date/time, time is a Date object
      // if you want, you can only redraw the changed parts:
      if (changed.d) // redraw date (changed.h/m/s will also all be true)
      if (changed.h) // redraw hours
      if (changed.m) // redraw minutes
      if (changed.s) // redraw seconds
    },
    pause: function() {   // optional, called when the screen turns off
      // for example: turn off GPS/compass if the watch used it
    },
    resume: function() {   // optional, called when the screen turns on
      // for example: turn GPS/compass back on
    },
    remove: function() {   // optional, used for Fast Loading
      // for example: remove listeners
      // Fast Loading will not be used unless this function is present,
      // if there is nothing to clean up, you can just leave it empty.
    },
    up: function() {   // optional, up handler
    },
    down: function() {   // optional, down handler
    },
    upDown: function(dir) {   // optional, combined up/down handler
      if (dir === -1) // Up
      else // (dir === 1): Down
    },
    settingsFile: 'appid.settings.json', // optional, values from file will be applied to `this`
  });
clock.start();

```


Simple Usage
------------
Basic clocks can pass just a function to redraw the entire screen every minute:

```js

var ClockFace = require("ClockFace");
var clock = new ClockFace(function(time) {
  // draw the current time at the center of the screen
  g.setFont("Vector:50").setFontAlign(0, 0)
    .drawString(
      require("locale").time(time, true), 
      Bangle.appRect.w/2, Bangle.appRect.h/2
    );
});
clock.start();

```


SettingsFile
------------
If you use the `settingsFile` option, values from that file are loaded and set
directly on the clock.

For example:

```json
// example.settings.json:
{
  "showDate": false,
  "foo": 123
}
```
```js
   var ClockFace = require("ClockFace");
   var clock = new ClockFace({
     draw: function(){/*...*/},
     settingsFile: "example.settings.json",
   });
   // now
   clock.showDate === false;
   clock.foo === 123;
   clock.hideWidgets === 0; // default when not in settings file
   clock.is12Hour === ??; // not in settings file: uses global setting
   clock.start();

```

Properties
----------
The following properties are automatically set on the clock:
* `is12Hour`: `true` if the "Time Format" setting is set to "12h", `false` for "24h".
* `paused`: `true` while the clock is paused.  (You don't need to check this inside your `draw()` code)
* `showDate`: `true` (if not overridden through the settings file.)
* `hideWidgets`: `0` (if not overridden through the settings file.)   
   If set to `1` before calling `start()`, the clock calls `require("widget_utils")hide();` for you. 
   (Bangle.js 2 only: `2` for swipe-down)
   Best is to add a setting for this, but if you never want to show widgets, you could do this:
   ```js
   var ClockFace = require("ClockFace");
   var clock = new ClockFace({draw: function(){/*...*/}});
   clock.hideWidgets = 1; // hide widgets
   clock.start();
   ```

Inside the `draw()`/`update()` function you can access these using `this`:

```js

var ClockFace = require("ClockFace");
var clock = new ClockFace({
  draw: function (time) {
    if (this.is12Hour) // draw 12h time
    else // use 24h format
  }
});
clock.start();

Bangle.on('step', function(steps) {
  if (clock.paused === false) // draw step count
});

```


ClockFace_menu
==============
If your clock comes with a settings menu, you can use this library to easily add
some common options:

```js

let settings = require("Storage").readJSON("<appid>.settings.json", true)||{};
function save(key, value) {
  settings[key] = value;
  require("Storage").writeJSON("<appid>.settings.json", settings);
}

let menu = {
  "": {"title": /*LANG*/"<clock name> Settings"},
};
require("ClockFace_menu").addItems(menu, save, { 
  showDate: settings.showDate, 
  hideWidgets: settings.hideWidgets,
});
E.showMenu(menu);

```

Or even simpler, if you just want to use a basic settings file:
```js
let menu = {
  "": {"title": /*LANG*/"<clock name> Settings"},
  /*LANG*/"< Back": back,  
};
require("ClockFace_menu").addSettingsFile(menu, "<appid>.settings.json", [ 
  "showDate", "hideWidgets", "powerSave",
]);
E.showMenu(menu);

```