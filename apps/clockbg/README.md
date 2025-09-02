# Clock Backgrounds

This app provides a library (`clockbg`) that can be used by clocks to
provide different backgrounds for them.

## Usage

By default the app provides just a red/green/blue background but it can easily be configured.

You can either:

* Go to [the Clock Backgrounds app](https://banglejs.com/apps/?id=clockbg) in the App Loader and use pre-made image backgrounds (or upload your own)
* Go to the `Backgrounds` app on the Bangle itself, and choose between:
  * `Solid Color` - one color that never changes
  * `Random Color` - a new color every time the clock starts
  * `Image` - choose from a previously uploaded image
  * `Squares` - a randomly generated pattern of squares in the selected color palette
  * `Plasma` - a randomly generated 'plasma' pattern of squares in the selected color palette (random noise with a gaussian filter applied)
  * `Rings` - randomly generated rings in the selected color palette
  * `Tris` - randomly generated overlapping triangles in the selected color palette


## Usage in code

Just use the following to use this library within your code:

```JS
// once at the start
let background = require("clockbg");

// to fill the whole area
background.fillRect(Bangle.appRect);

// to fill just one part of the screen
background.fillRect(x1, y1, x2, y2);

// if you ever need to reload to a new background (this could take ~100ms)
background.reload();
```

You should also add `"dependencies" : { "clockbg":"module" },` to your app's metadata to
ensure that the clock background library is automatically loaded.

## Features to be added

A few features could be added that would really improve functionality:

* When 'fast loading', 'random' backgrounds don't update at the moment (calling `.reload` can fix this now, but it slows things down)
* Support for >1 image to be uploaded (requires some image management in `interface.html`), and choose randomly between them
* Support for gradients (random colors)
* More types of auto-generated pattern (as long as they can be generated quickly or in the background)
* Storing 'clear' areas of uploaded images so clocks can easily position themselves
* Some backgrounds could update themselves in the background (eg a mandelbrot could calculate the one it should display next time while the watch is running)