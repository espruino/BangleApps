Bangle.js Dial Module
=====================

> Take a look at README.md for hints on developing with this module.

Usage
-----

```JS
var dial = require("dial")(cb, options);
Bangle.on("drag", dial);
```

For example:

```JS
let cb = (plusOrMinusOne)=>{print(plusOrMinusOne)};
let options = {
  stepsPerWholeTurn : 6,
  dialRect : {
    x: 0,
    y: 0,
    w: g.getWidth()/2,
    h: g.getHeight()/2,
  }
}

let dial = require("dial")(cb, options);
Bangle.on("drag", dial);
```

`cb` (first argument) is a callback function that should expect either `+1` or `-1` as argument when called.

`options` (second argument) (optional) is an object containing:

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

Notes
-----

A complementary module for drawing graphics is provided in the Dial_Display module.
