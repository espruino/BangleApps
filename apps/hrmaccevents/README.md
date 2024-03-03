# Record HRM and accelerometer events

Record events as they happen via bluetooth or to a file.
This app can use [BTHRM](https://banglejs.com/apps/#bthrm) as a reference.

## Steps for usage

* (Optional) Install [BTHRM](https://banglejs.com/apps/#bthrm) as reference (use ECG based sensor for best accuracy).
  * Configure BTHRM to "Both"-Mode or use a version >= 0.12. This prevents data beeing lost because BTHRM can replace the HRM-events data with BTHRM data.
* Click "Start" in browser.
* Wait until the "Events" number starts to grow, that means there are events recorded.
* Record for some time, since BTHRM and HRM often need some seconds to start getting useful values. Consider 2000 events a useful minimum.
* (Recording to file) Stop the recording with a long press of the button and download log.csv with the Espruino IDE.
* (Recording to browser) Click "Stop" followed by "Save" and store the resulting file on your device.


## CSV data format

The CSV data contains the following columns:

* Time - Current time (milliseconds since 1970)
* Acc_x,Acc_y,Acc_z - X,Y,Z acceleration in Gs
* HRM_b - BPM figure reported by internal HRM algorithm in Bangle.js
* HRM_c - BPM confidence figure (0..100%) reported by internal HRM algorithm in Bangle.js
* HRM_r - `e.raw` from the `Bangle.on("HRM-raw"` event. This is the value that gets passed to the HRM algorithm.
* HRM_f - `e.filt` from the `Bangle.on("HRM-raw"` event. This is the filtered value that comes from the Bangle's HRM algorithm and which is used for peak detection
* PPG_r - `e.vcPPG` from the `Bangle.on("HRM-raw"` event. This is the PPG value direct from the sensor
* PPG_o - `e.vcPPGoffs` from the `Bangle.on("HRM-raw"` event. This is the PPG offset used to map `e.vcPPG` to `e.raw` so there are no glitches when the exposure values in the sensor change.
* BTHRM - BPM figure from external Bluetooth HRM device (this is our reference BPM)

## FIXME

The `custom.html` for the app uses the Puck.js lib directly when it should just use `customize.js` - it won't work well under Gadgetbridge and may fail on other platforms too

## Creator

[halemmerich](https://github.com/halemmerich)
