# Box Clock

Box Clock is a customizable Bangle.js 2 clock built around named layouts. Use the App Loader customizer to arrange boxes in a live preview, save multiple layouts, and switch between them on the watch.

## Why Use It

- Easy customization in the web editor. Drag boxes, rename them, change fonts, colors, outlines, and backgrounds without hand-editing files.
- Multiple layouts. Keep different looks for work, weekends, travel, dark rooms, or whatever else you want.
- `clockbg` support. A layout can use your current Clock Backgrounds setup, or you can switch to a solid color, bundled image, or uploaded image.
- Works with Bangle.js Fast Load and `clockbg`.

## Quick Start

1. Install Box Clock from the App Loader.
2. Open the `Customizer`.
3. Pick a layout, or create a new one from an existing preset.
4. Drag boxes on the preview, edit their text and appearance, and choose a background.
5. Upload the result to the watch.
6. On the watch, choose the layout you want from Box Clock settings.

You do not need to edit JSON for the normal workflow. The web editor is the main way to customize Box Clock.

## Layouts

Box Clock stores its face as named layouts.

It installs with a default layout. The customizer also includes optional example layouts that you can add separately.

Each saved layout is independent, so you can keep multiple layouts and switch between them from the watch.

## Background Options

Each layout can use one of these background modes:

- `clockbg`
- `solid`
- `image`

If you use `clockbg`, Box Clock can follow the background you already set up with the Clock Backgrounds app. That gives you one place to manage shared backgrounds while still letting Box Clock have multiple layouts.

If you want a layout-specific look instead, you can pick:

- a bundled image
- a custom uploaded image
- a solid color

## What You Can Customize

In the web editor you can:

- add boxes for time, date, day, meridian, battery, steps, or custom text
- drag boxes directly on the watch preview
- resize text and box boundaries
- duplicate, reorder, and delete boxes
- rename layouts
- duplicate layouts
- upload backgrounds and preview them before sending them to the watch

## On-Watch Editing

If you only need a quick position tweak on the watch:

- triple-tap the clock to enter layout mode
- tap a box to select it
- drag it into place
- double-tap the background to save and exit

The web editor is still the better option for full customization.

## Compatibility

Built for Bangle.js 2.

## Creator

[stweedo](https://github.com/stweedo)
