Slider Library
==============

*At time of writing in October 2023 this module is new and things are more likely to change during the coming weeks than in a month or two.*

> Take a look at README.md for hints on developing with this library.

Usage
-----

```js
var Slider = require("Slider");
var slider =  Slider(callbackFunction, configObject);

Bangle.on("drag", slider.f.dragSlider);

// If the slider should take precedent over other drag handlers use (fw2v18 and up):
// Bangle.prependListener("drag", slider.f.dragSlider);
```

`callbackFunction` (`cb`) (first argument) determines what `slider` is used for. `slider` will pass three arguments, `mode`, `feedback` (`fb`) and (if fired from an input event) `event` (`e`), into `callbackFunction` (if `slider` is interactive or auto progressing). The different `mode`/`feedback` combinations to expect are:
- `"map", o.v.level` | current level when interacting by mapping interface.
- `"incr", incr` | where `incr` == +/-1, when interacting by incrementing interface.
- `"remove", o.v.level` | last level when the slider times out.
- `"auto", o.v.level` | when auto progressing.

The event will be a drag, from the `Bangle.on('drag', ...)` event.

The callback function will always be called for the "final" event, which is when the user lifts their finger from the screen. This can be detected by looking for `e.b == 0`.

`configObject` (`conf`) (second argument, optional) has the following defaults:

```js
R = Bangle.appRect; // For use when determining defaults below.

{
initLevel:       0,                     // The level to initialize the slider with.
horizontal:      false,                 // Slider should be horizontal?
xStart:          R.x2-R.w/4-4,          // Leftmost x-coordinate. (Uppermost y-coordinate if horizontal)
width:           R.w/4,                 // Width of the slider. (Height if horizontal)
yStart:          R.y+4,                 // Uppermost y-coordinate. (Rightmost x-coordinate if horizontal)
height:          R.h-10,                // Height of the slider. (Width if horizontal)
steps:           30,                    // Number of discrete steps of the slider.

dragableSlider:  true,                  // Should supply the sliders standard interaction mechanisms?
dragRect:        R,                     // Accept input within this rectangle.
mode:            "incr",                // What mode of draging to use: "map", "incr" or "mapincr".
oversizeR:       0,                     // Determines if the mapping area should be extend outside the indicator (Right/Up).
oversizeL:       0,                     // Determines if the mapping area should be extend outside the indicator (Left/Down).
propagateDrag:   false,                 // Pass the drag event on down the handler chain?
timeout:         1,                     // Seconds until the slider times out. If set to `false` the slider stays active. The callback function is responsible for repainting over the slider graphics.

drawableSlider:  true,                  // Should supply the sliders standard drawing mechanism?
colorFG:         g.theme.fg2,           // Foreground color.
colorBG:         g.theme.bg2,           // Background color.
rounded:         true,                  // Slider should have rounded corners?
outerBorderSize: Math.round(2*R.w/176), // The size of the visual border. Scaled in relation to Bangle.js 2 screen width/typical app rectangle widths.
innerBorderSize: Math.round(2*R.w/176), // The distance between visual border and the slider.

autoProgress:    false,                 // The slider should be able to progress automatically?
}
```

A slider initiated in the Web IDE terminal window reveals its internals to a degree:
```js
slider = require("Slider").create(()=>{}, {autoProgress:true})
={
  v: { level: 0, ebLast: 0, dy: 0 },
  f: {
    wasOnDragRect: function (exFirst,eyFirst) { ... },   // Used internally.
    wasOnIndicator: function (exFirst) { ... },          // Used internally.
    dragSlider: function (e) { ... },                    // The drag handler.
    remove: function () { ... },                         // Used to remove the drag handler and run the callback function.
    updateBar: function (levelHeight) { ... },           // Used internally to get the variable height rectangle for the indicator.
    draw: function (level) { ... },                      // Draw the slider with the supplied level.
    autoUpdate: function () { ... },                     // Used to update the slider when auto progressing.
    initAutoValues: function () { ... },                 // Used internally.
    startAutoUpdate: function (intervalSeconds) { ... }, // `intervalSeconds` defaults to 1 second if it's not supplied when `startAutoUpdate` is called.
    stopAutoUpdate: function () { ... }                  // Stop auto progressing and clear some related values.
   },
  c: { initLevel: 0, horizontal: false, xStart: 127, width: 44,
    yStart: 4, height: 166, steps: 30, dragableSlider: true,
    dragRect: { x: 0, y: 0, w: 176, h: 176,
      x2: 175, y2: 175 },
    mode: "incr",
    oversizeR: 0, oversizeL: 0, propagateDrag: false, timeout: 1, drawableSlider: true,
    colorFG: 63488, colorBG: 8, rounded: 22, outerBorderSize: 2, innerBorderSize: 2,
    autoProgress: true, _rounded: 18, STEP_SIZE: 4.06666666666, _xStart: 131, _width: 36,
    _yStart: 8, _height: 158,
    r: { x: 127, y: 4, x2: 171, y2: 170,
      w: 44, h: 166 },
    borderRect: { x: 127, y: 4, w: 44, h: 166,
      r: 22 },
    hollowRect: { x: 129, y: 6, w: 40, h: 162,
      r: 22 }
   }
 }
>
```
Tips
----

You can implement custom graphics for a slider in the `callbackFunction`. The slider test app mentioned in the links below do this. To draw on top of the included slider graphics you need to wrap the drawing code in a timeout somewhat like so: `setTimeout(drawingFunction,0,fb)` (see [`setTimeout` documentation](https://www.espruino.com/Reference#l__global_setTimeout)).

Links
-----

There is a [slider test app on thyttan's personal app loader](https://thyttan.github.io/BangleApps/?q=slidertest) (at time of writing). Looking at [its code](https://github.com/thyttan/BangleApps/blob/ui-slider-lib/apps/slidertest/app.js) is a good way to see how the slider is used in app development.

The version of [Remote for Spotify on thyttan's personal app loader](https://thyttan.github.io/BangleApps/?q=spotrem) (at time of writing) also utilizes the `Slider` module. Here is [the code](https://github.com/thyttan/BangleApps/blob/ui-slider-lib/apps/spotrem/app.js).
