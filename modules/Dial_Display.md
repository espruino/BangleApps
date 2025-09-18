Bangle.js Dial Display Module
=============================


> Take a look at README.md for hints on developing with this module.

Usage
-----

```JS
var DialDisplay = require("Dial_Display");
var dialDisplay = new DialDisplay(options);

dialDisplay.step(-1);

var value = dialDisplay.value;

// ... after some time:
dialDisplay.queueRedraw();
dialDisplay.set(0);
```

For example in use with the Dial module:

```JS
var options = {
  stepsPerWholeTurn : 6,
  dialRect : {
    x: 0,
    y: 0,
    w: g.getWidth()/2,
    h: g.getHeight()/2,
  }
}

var DialDisplay = require("Dial_Display");
var dialDisplay = new DialDisplay(options);

var cb = (step) => {
  dialDisplay.step(step);
};

var dial = require("dial")(cb, options)
Bangle.on("drag", dial);
```

`options` (first argument) (optional) is an object containing:

`stepsPerWholeTurn` - how many steps there are in one complete turn of the dial.
`dialRect` - decides the area of the screen the dial is set up on.

Defaults:
```js
{ stepsPerWholeTurn : 7
  dialRect : {
    x: 0,
    y: 0,
    w: g.getWidth(),
    h: g.getHeight(),
  },
}
```

The Dial Display has three functions:
`step(amount)` - +1 or -1 to step the dial.
`set(value)` - set the value for the next `step()` to act on.
`queueRedraw()` - draw all of the dial (instead of just the indicator) on the next `step()`.

Notes:
======
- It would be nice to choose what colors are used. Something for the future.
