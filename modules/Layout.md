Bangle.js Layout Library
========================

> Take a look at README.md for hints on developing with this library.

Usage
-----

```JS
var Layout = require("Layout");
var layout = new Layout(layoutObject, options)

layout.render(optionalObject);
```

For example:

```JS
var Layout = require("Layout");
var layout = new Layout({
  type:"v",
  c: [
    { type: "txt", font: "20%", label: "12:00" },
    { type: "txt", font: "6x8", label: "The Date" }
  ]
});

g.clear();

layout.render();
```

`layoutObject` (first argument) has:

- A `type` field of:
  - `undefined` - blank, can be used for padding
  - `"txt"` - a text label, with value `label`. `font` is required
  - `"btn"` - a button, with value `label` and callback `cb`. Optional `src` specifies an image (like img) in which case label is ignored. Default font is `6x8`, scale 2. This can be overridden with the `font` or `scale` fields.
  - `"img"` - an image where `src` is an image, or a function which is called to return an image to draw
  - `"custom"` - a custom block where `render(layoutObj)` is called to render
  - `"h"` - Horizontal layout, `c` is an array of more `layoutObject`
  - `"v"` - Vertical layout, `c` is an array of more `layoutObject`
- A `id` field. If specified the object is added with this name to the returned `layout` object, so can be referenced as `layout.foo`
- A `font` field, eg `6x8` or `30%` to use a percentage of screen height. Set scale with :, e.g. `6x8:2`.
- A `scale` field, eg `2` to set scale of an image
- A `r` field to set rotation of text or images (0: 0°, 1: 90°, 2: 180°, 3: 270°).
- A `wrap` field to enable line wrapping. Requires some combination of `width`/`height` and `fillx`/`filly` to be set. Not compatible with text rotation.
- A `col` field, eg `#f00` for red. When `type:"btn"`, this sets the color of the button's text label (defaults to `Graphics.theme.fg2` if not set)
- A `bgCol` field for background color (will automatically fill on render). When `type:"btn"`, this sets the color of the space outside the button border (defaults to parent layoutObject's `bgCol` if not set)
- A `btnBorderCol` field for button border color (defaults to `Graphics.theme.fg2` if not set)
- A `btnFaceCol` field for the background color of the area inside the button border (defaults to `Graphics.theme.bg2` if not set)
- A `halign` field to set horizontal alignment WITHIN a `v` container. `-1`=left, `1`=right, `0`=center
- A `valign` field to set vertical alignment WITHIN a `h` container. `-1`=top, `1`=bottom, `0`=center
- A `pad` integer field to set pixels padding
- A `fillx` int to choose if the object should fill available space in x. 0=no, 1=yes, 2=2x more space
- A `filly` int to choose if the object should fill available space in y. 0=no, 1=yes, 2=2x more space
- `width` and `height` fields to optionally specify minimum size


 `options` (second argument) is an object containing:


- `lazy` - a boolean specifying whether to enable automatic lazy rendering
- `btns` - array of objects containing:
  - `label` - the text on the button
  - `cb` - a callback function
  - `cbl` - a callback function for long presses
- `back` - a callback function, passed as `back` into Bangle.setUI (which usually adds an icon in the top left)
- `remove` - a cleanup function, passed as `remove` into Bangle.setUI (allows to cleanly remove the app from memory)

If automatic lazy rendering is enabled, calls to `layout.render()` will attempt to automatically determine what objects have changed or moved, clear their previous locations, and re-render just those objects.

Once `layout.update()` is called, the following fields are added to each object:

- `x` and `y` for the top left position
- `w` and `h` for the width and height
- `_w` and `_h` for the **minimum** width and height

Other functions:

- `layout.update()` - update positions of everything if contents have changed
- `layout.debug(obj)` - draw outlines for objects on screen
- `layout.clear(obj)` - clear the given object (you can also just specify `bgCol` to clear before each render)
- `layout.forgetLazyState()` - if lazy rendering is enabled, makes the next call to `render()` perform a full re-render
- `layout.setUI()` - Re-add any UI input handlers


Using with `E.showMenu`/`E.showPrompt`/etc
--------------------------------------

When calling `E.showMenu` or anything that internally calls `Bangle.setUI` to set
handlers for user input, any input handlers set by `layout` will get removed.

To re-add them (and re-render the screen) you must call the following afterwards:

```
layout.setUI(); // re-add input handlers
layout.forgetLazyState(); // if using lazy rendering, ensure we re-render everything
layout.render(); // render screen
```


Links
-----

- [Official tutorial](https://www.espruino.com/Bangle.js+Layout)
