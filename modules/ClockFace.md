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
    loadWidgets: true, // optional, defaults to true
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
    up: function() {   // optional, up handler
    },
    down: function() {   // optional, down handler
    },
    upDown: function(dir) {   // optional, combined up/down handler
      if (dir === -1) // Up
      else // (dir === 1): Down
    },
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

Properties
----------
The following properties are automatically set on the clock:
* `is12Hour`: `true` if the "Time Format" setting is set to "12h", `false` for "24h".
* `paused`: `true` while the clock is paused.  (You don't need to check this inside your `draw()` code)

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