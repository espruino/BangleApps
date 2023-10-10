Slider Library
========================

> Take a look at README.md for hints on developing with this library.

Usage
-----

```JS
var Slider = require("Slider");
var slider =  Slider(callbackFunction, configObject);

Bangle.on("drag", slider.f.dragSlider);

// If the slider should take precedent over other drag handlers use (fw2v18 and up):
// Bangle.prependListener("drag", slider.f.dragSlider);
```

`callbackFunction` (`cb`) (first argument) determines what `slider` is used for. `slider` will pass two arguments, `mode` and `feedback` (`fb`), into `callbackFunction` (if `slider` is interactive or auto progressing). The different `mode`/`feedback` combinations to expect are:
- `"map", o.v.level` | current level when interacting by mapping interface.
- `"incr", incr` | where `incr` == +/-1, when interacting by incrementing interface.
- `"remove", o.v.level` | last level when the slider times out.
- `"auto"` | on its own, when auto progressing.

`configObject` (`conf`) (second argument, optional) has the following defaults:

```js
R = Bangle.appRect; // For use when determining defaults below.

{
currLevel:       undefined,    // The level to initialize the slider with.
horizontal:      false,        // Slider should be horizontal?
xStart:          R.x2-R.w/4-4, // Leftmost x-coordinate. (Uppermost y-coordinate if horizontal)
width:           R.w/4,        // Width of the slider. (Height if horizontal)
yStart:          R.y+4,        // Uppermost y-coordinate. (Rightmost x-coordinate if horizontal)
height:          R.h-10,       // Height of the slider. (Width if horizontal)
steps:           30,           // Number of discrete steps of the slider.

dragableSlider:  true,         // Should supply the sliders standard interaction mechanisms?
dragRect:        R,            // Accept input within this rectangle.
mode:            "incr",       // What mode of draging to use: "map", "incr" or "mapincr".
oversizeR:       0,            // Determines if the mapping area should be extend outside the indicator (Right/Up).
oversizeL:       0,            // Determines if the mapping area should be extend outside the indicator (Left/Down).
propagateDrag:   false,        // Pass the drag event on down the handler chain?
timeout:         1,            // Seconds until the slider times out.

drawableSlider:  true,         // Should supply the sliders standard drawing mechanism?
colorFG:         g.theme.fg2,  // Foreground color.
colorBG:         g.theme.bg2,  // Background color.
rounded:         true,         // Slider should have rounded corners?
outerBorderSize: 2,            // The size of the visual border.
innerBorderSize: 2,            // The distance between visual border and the slider.

autoProgress:    false,        // The slider should be able to progress automatically?
}
```

A slider initiated in the Web IDE terminal window reveals its internals to a degree:
```js
>slider = require("Slider").create(()=>{}, {autoProgress:true})
={
  v: { level: 15, ebLast: 0, dy: 0 },
  f: {
    wasOnDragRect: function (exFirst,eyFirst) { ... },
    wasOnIndicator: function (exFirst) { ... },
    dragSlider: function (e) { ... },
    remove: function () { ... },
    updateBar: function (levelHeight) { ... },
    draw: function (level) { ... },
    autoUpdate: function () { ... },
    initAutoValues: function () { ... },
    startAutoUpdate: function () { ... },
    stopAutoUpdate: function () { ... }
   },
  c: { mode: "incr", horizontal: false, xStart: 127,
    width: 44, yStart: 28, height: 142, steps: 30, oversizeR: 0,
    oversizeL: 0, timeout: 1, colorFG: 65535, colorBG: 8, rounded: 20,
    propagateDrag: false, autoProgress: true, outerBorderSize: 2, innerBorderSize: 2,
    drawableSlider: true, dragableSlider: true, currLevel: undefined,
    dragRect: { x: 0, y: 24, w: 176, h: 152,
      x2: 175, y2: 175 },
    _xStart: 131, _width: 36, _yStart: 32, _height: 134, STEP_SIZE: 3.36666666666,
    r: { x: 127, y: 28, x2: 171, y2: 170,
      w: 44, h: 142 },
    borderRect: { x: 127, y: 28, w: 44, h: 142,
      r: 20 },
    hollowRect: { x: 129, y: 30, w: 40, h: 138,
      r: 20 }
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
