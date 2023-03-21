# Bluetooth Heart Rate Monitor

When this app is installed it overrides Bangle.js's build in heart rate monitor with an external Bluetooth one.

HRM is requested it searches on Bluetooth for a heart rate monitor, connects, and sends data back using the `Bangle.on('HRM')` event as if it came from the on board monitor.

This means it's compatible with many Bangle.js apps including:

* [Heart Rate Widget](https://banglejs.com/apps/#widhrt)
* [Heart Rate Recorder](https://banglejs.com/apps/#heart)

It it NOT COMPATIBLE with [Heart Rate Monitor](https://banglejs.com/apps/#hrm)
as that requires live sensor data (rather than just BPM readings).

## Usage

Just install the app, then install an app that uses the heart rate monitor.

Once installed you will have to go into this app's settings while your heart rate monitor
 is available for bluetooth pairing and scan for devices.

**To disable this and return to normal HRM, uninstall the app or change the settings**

### Modes

* Off - Internal HRM is used, no attempt on connecting to BT HRM.
* Default - Replaces internal HRM with BT HRM and falls back to internal HRM if no valid measurements received.
* Both - The BT HRM needs to be started explicitly by an app that wants to use it. BT HRM has its own event and is completely separated from the internal HRM. Apps not supporting the BT HRM will not see the BT HRM measurements.
* Custom - Combine low level settings as you see fit.

## Compatible Heart Rate Monitors

This works with any heart rate monitor providing the standard Bluetooth
Heart Rate Service (`180D`) and characteristic (`2A37`). It additionally supports
the location (`2A38`) characteristic and the Battery Service (`180F`), reporting
that information in the `BTHRM` event when they are available.

So far it has been tested on:

* CooSpo Bluetooth Heart Rate Monitor
* Polar H10
* Polar OH1
* Wahoo TICKR X 2

## Recorder plugin

The recorder plugin can record the BT HRM event (blue) and the original unchanged HRM event (green). This is mainly useful for debugging purposes or comparing the BT with the internal HRM, as the resulting "merged" HRM can be recordet using the default HRM recorder.

## Internals

This replaces `Bangle.setHRMPower` with its own implementation.

## TODO

* A widget to show connection state?

## Creator

Gordon Williams
