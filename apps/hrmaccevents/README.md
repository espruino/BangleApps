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

## Creator

[halemmerich](https://github.com/halemmerich)
