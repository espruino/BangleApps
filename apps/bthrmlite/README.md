# Bluetooth Heart Rate Monitor - Lite

When this app is installed it overrides Bangle.js's built in heart rate monitor with an external Bluetooth one.

The [`bthrm` app](https://banglejs.com/apps/?id=bthrm) is a much more sophisticated version of this app, however is uses a lot more
RAM so may not be suitable for Bangle.js 1.

HRM is requested it searches on Bluetooth for a heart rate monitor, connects, and sends data back using the `Bangle.on('HRM'` event as if it came from the on board monitor.

This means it's compatible with many Bangle.js apps including:

* [Heart Rate Widget](https://banglejs.com/apps/#widhrt)
* [Heart Rate Recorder](https://banglejs.com/apps/#heart)

It it NOT COMPATIBLE with [Heart Rate Monitor](https://banglejs.com/apps/#hrm)
as that requires live sensor data (rather than just BPM readings).

## Usage

Just install the app, then install an app that uses the heart rate monitor.

Once an app requests Heart Rate `bthrmlite` will automatically try and connect to the first bluetooth
heart rate monitor it finds.

**To disable this and return to normal HRM, uninstall the app**

## Compatible Heart Rate Monitors

This works with any heart rate monitor providing the standard Bluetooth
Heart Rate Service (`180D`) and characteristic (`2A37`).

So far it has been tested on:

* CooSpo Bluetooth Heart Rate Monitor

## Internals

This replaces `Bangle.setHRMPower` with its own implementation.

To get debug info, you can call `Bangle.enableBTHRMLog()` in the IDE to enable log messages.

## Creator

Gordon Williams