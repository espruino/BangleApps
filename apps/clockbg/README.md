# Clock Backgrounds

This app provides a library (`clockbg`) that can be used by clocks to
provide different backgrounds for them.

## Usage

By default the app provides just a red/green/blue background but it can easily be configured.

You can either:

* Go to [the Clock Backgrounds app](https://banglejs.com/apps/?id=clockbg) in the App Loader and upload backgrounds
* Go to the `Backgrounds` app on the Bangle itself, and choose between solid color, random colors, or any uploaded images.


## Usage in code

Just use the following to use this library within your code:

```JS
// once at the start
let background = require("clockbg");

// to fill the whole area
background.fillRect(Bangle.appRect);

// to fill just one part of the screen
background.fillRect(x1, y1, x2, y2);
```

You should also add `"dependencies" : { "clockbg":"module" },` to your app's metadata to
ensure that the clock background library is automatically loaded.

## Features to be added

This library/app is still pretty basic right now, but a few features could be added that would really improve functionality:

* Support for >1 image, and choosing randomly between them
* Support for gradients (random colors)
* Storing 'clear' areas of uploaded images so clocks can easily position themselves