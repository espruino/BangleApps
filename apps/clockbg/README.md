# Clock Backgrounds

This app provides a library (`clockbg`) that can be used by clocks to
provide different backgrounds for them.

## Usage

By default the app provides just a red/green/blue background but it can easily be configured.

You can either:

* Go to [the Clock Backgrounds app](https://banglejs.com/apps/?id=clockbg) in the App Loader and use pre-made image backgrounds (or upload your own)
* Go to the `Backgrounds` app on the Bangle itself, and choose between:
  * `Solid Color` - One color that never changes
  * `Random Color` - A new color every time the clock starts
  * `Image` - Choose from a previously uploaded image
  * `Squares` - A randomly generated pattern of squares in the selected color palette
  * `Plasma` - A randomly generated 'plasma' pattern of squares in the selected color palette (random noise with a gaussian filter applied)
  * `Rings` - Randomly generated rings in the selected color palette
  * `Tris` - Randomly generated overlapping triangles in the selected color palette
  * `Blobs` - Randomly generated blobs of color in the selected color palette
  * `Gradient` - A gradient from top to bottom with the selected colors

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

// Call this to unload (free memory - eg in .remove when fast loading)
background.unload();

// If .unload has been called and you might have fast-loaded back, call .load to ensure everything is loaded again!
// It won't reload if it's already been loaded
background.load();
```

You should also add `"dependencies" : { "clockbg":"module" },` to your app's metadata to
ensure that the clock background library is automatically loaded.

## Features to be added

A few features could be added that would really improve functionality:

* When 'fast loading', 'random' backgrounds don't update at the moment (calling `.reload` can fix this now, but it slows things down)
* Support for >1 image to be uploaded (requires some image management in `interface.html`), and choose randomly between them
* Support for random colored gradients
* More types of auto-generated pattern (as long as they can be generated quickly or in the background)
* Storing 'clear' areas of uploaded images so clocks can easily position themselves
* Some backgrounds could update themselves in the background (eg a mandelbrot could calculate the one it should display next time while the watch is running)