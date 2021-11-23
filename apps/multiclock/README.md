# Multiclock

This is a clock app that supports multiple clock faces. The user can switch between faces while retaining widget state which makes the switch fast. Currently there are four clock faces as shown below. There are currently an anlog, digital, text, big digit, time and date, and a clone of the Nifty-A-Clock faces.
### Analog Clock Face


## Controls
Uses `setUI("clockupdown")`
BTN1 & BTH3  switch faces on the Bangle.
Touch upper right and lower right quadrant switch faces on the Bangle 2.

## Adding a new face
Clock faces are described in javascript storage files named `name.face.js`. For example, the Analog Clock Face is described in `ana.face.js`. These files have the following structure:

```
(() => {
    function getFace(){
	    function onSecond(){
	       //draw digits, hands etc
	    }
	    function drawAll(){
	       //draw background + initial state of digits, hands etc
	    }
    	return {init:drawAll, tick:onSecond, tickpersec:true};
    }
    return getFace;
})();
```
For those familiar with the structure of widgets, this is similar, however, there is an additional level of function nesting. This means that although faces are loaded when the clock app starts running they are not instantiated until their `getFace` function is called, i.e.  memory is not allocated to structures such as image buffer arrays declared in `getFace` until the face is selected. Consequently, adding a face does not require a lot of extra memory. 

The app at start up loads all files `*.face.js`. The simplest way of adding a face is thus to load it into `Storage` using the WebIDE. Similarly, to remove an unwanted face, simply delete it from `Storage` using the WebIDE.

If `tickpersec` is false then `tick` is only called each minute as this is more power effcient - especially on the BAngle 2.

