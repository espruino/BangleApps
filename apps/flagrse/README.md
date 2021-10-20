# Espruino Flag Raiser

An app to send a command to another Espruino to cause it to raise a flag.

For this to work, you need to upload the following code to another
bluetooth Espruino device (the one with the flag attached) :

```
var FLAG_PIN = D14;

var s = require("servo").connect(FLAG_PIN);
s.move(1,3000); // move to position 1 over 3 seconds

var timeout;
function flag() {
  if (timeout) clearTimeout();
  s.move(0.2,2000);
  timeout = setTimeout(function() {
    timeout = undefined;
    s.move(1,2000);
  },2000);
}

setWatch(flag, BTN, {repeat:true});

NRF.setServices({
  "3e440001-f5bb-357d-719d-179272e4d4d9": {
    "3e440002-f5bb-357d-719d-179272e4d4d9": {
      value : [0],
      maxLen : 1,
      writable : true,
      onWrite : function(evt) {
        flag();
      }
    }
  }
}, { uart : false });
NRF.setAdvertising({}, {name:"Flag"});
```

## Wiring

This is designed for an [MDBT42Q Breakout board](http://www.espruino.com/MDBT42Q)
but should work on any Bluetooth LE Espruino device - you just need to change `FLAG_PIN`
to the name of the pin that's connected to the servo motor.

However, as designed:

* Get an [MDBT42Q Breakout board](http://www.espruino.com/MDBT42Q)
* Connect `GND` to GND (black) of a 3.7v LiPo battery
* Connect `Vin` to positive (red) of the battery
* Take a servo motor and:
  * Connect the Black wire to `GND` (LiPo GND)
  * Connect the Red wire to `Vin` (LiPo 3.7v)
  * Connect the White wire to `D14` on the MDBT42Q

## How does it work?

The code above changes the advertised name of the Espruino device to be
`Flag` (which the app then searches for).

Then, it adds a service UUID `3e440001-f5bb-357d-719d-179272e4d4d9` (this
is just a random number we made up) with characteristic `3e440002-f5bb-357d-719d-179272e4d4d9`
(the same UUID with the second 16 bits incremented). When the characteristic
is written (with any data), `flag()` is called, which raises the flag.

`flag()` itself uses the [servo module](http://www.espruino.com/Servo+Motors)
to allow the servo motor to be controlled easily.

You might find the [Espruino About Bluetooth LE page](http://www.espruino.com/About+Bluetooth+LE)
is useful as an introduction to services and characteristics.

### Don't want to use a servo motor?

No problem, just replace `flag()` with a function that controls whatever you need
it to.
