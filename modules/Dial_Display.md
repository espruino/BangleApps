Bangle.js Dial Display Library
======================


> Take a look at README.md for hints on developing with this library.

Usage
-----

```JS
var DialDisplay = require("Dial_Display");
var dialDisplay = new DialDisplay(options);
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

var cb = (step)=>{
  var value = dialDisplay(step);
};

var Dial = require("Dial");
var dial = new Dial(cb, options)
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

