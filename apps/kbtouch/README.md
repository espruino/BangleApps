# Touch Keyboard

A library that provides an on-screen keyboard for text input.

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
