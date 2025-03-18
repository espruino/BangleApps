# BLE Cycling Speed Sencor (CSC)

Displays data from a BLE Cycling Speed and Cadence sensor.

Other than in the original version of the app, total distance is not stored on the Bangle, but instead is calculated from the CWR (cumulative wheel revolutions) reported by the sensor. This metric is, according to the BLE spec, an absolute value that persists throughout the lifetime of the sensor and never rolls over.

## Settings

Accessible from `Settings -> Apps -> BLE CSC`

Here you can set the wheel diameter

## Development

```
var csc = require("blecsc").getInstance();
csc.on("status", txt => {
  print("##", txt);
  E.showMessage(txt);
});
csc.on("data", e => print(e));
csc.start();
```

The `data` event contains:

 *  cwr/ccr => wheel/crank cumulative revs
 *  lwet/lcet => wheel/crank last event time in 1/1024s
 *  wrps/crps => calculated wheel/crank revs per second
 *  wdt/cdt => time period in seconds between events
 *  wr => wheel revs
 *  kph => kilometers per hour