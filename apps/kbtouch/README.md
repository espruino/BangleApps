# Touch Keyboard

A library that provides an on-screen keyboard for text input.

## Settings
Text size - small or big text font. Default=Big. Suggested=Small.

Offset keyboard - display the keyboard on top, making it faster to see what character you have selected. Default=No. Suggested=Yes.

Loop around - should the keyboard highlight loop around when going past the edges? Default=Yes. Suggested=No.

One-to-one input and release to select - should the input correspond directly to discrete areas on the screen, instead of being handled by scaled relative changes in position on swipes? Default=No. Suggested=Yes.

Speed scaling - how much should a swipe move the highligt on the keyboard? Higher number corresponds to slower movement. Not applicable if using one-to-one input. Default=24. Suggested=15.

## Usage

In your app's metadata, add:

```
  "dependencies": {"textinput":"type"},
```

From inside your app, call:

```
Bangle.loadWidgets();
Bangle.drawWidgets();
require("textinput").input({text:"Foo"}).then(result => {
  console.log("Text input", E.toJS(result));
});
```

The first argument to `input` is an object containing the following:

* `text` - initial text to edit

(in the future, the ability to restrict usage of newline/etc may be added)

## Make your own

You can create your own keyboard input apps. Just ensure that they have
`"type":"textinput",` in their metadata and provide a library called `textinput`
that exports an `input` method.

## To-do

Make this Bangle.js 1 compatible (use left/right touch and up/down buttons)
