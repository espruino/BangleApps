# GPS Setup

An App and module to enable the GPS to be configured into low power mode.

## Goals

To develop an app that configures the GPS to run with the lowest
possible power consumption.

Example power consumption of the GPS while powered on:

* An app that turns on the GPS and constantly displays the screen
  will use around 75mA, the battery will last between 3-4 hours.

* Using the GPS with Super-E Power Saving Mode (PSM) with the screen
  off most of the time, will consume around 35mA and you might get
  10hrs before a recharge.

* Using the GPS in Power Saving Mode On/Off (PSMOO) with suitable
  settings can reduce the average consumption to around 15mA.  A
  simple test using a 120s update period, 6s search period was still
  running with 45% battery 20 hours after it started.


## Settings App

The Settings App enables you set the options below. Either start the
App from the launcher or go to Settings, select App/Widgets and then
'GPS Setup'.

When you exit the setup app, the settings will be stored in the
gpssetup.settings.json file, the GPS will be switched on and the
necessary commands sent to the GPS to configure it. The GPS is then
powered off.  The GPS configuration is stored in the GPS non-volatile
memory so that next time the GPS is powered, that configuration is
used. These settings will remain for all apps that use the GPS.


- Power Mode:

   - **SuperE** - the factory default setup for the GPS. The recommended
   power saving mode.  If you need frequent (every second) updates on
   position, then this is the mode for you.

   - **PSMOO** - On/Off power saving mode. Configured by interval and
   search time. Choose this mode if you are happy to get a GPS
   position update less often (say every 1 or 2 minutes). The longer
   the interval the more time the GPS will spend sleeping in low
   power mode (7mA) between obtaining fixes (35mA).  For walking in
   open country an update once every 60 seconds is adequate to put
   you within a 6 digit grid refernce sqaure. 
   
      **Note:** For the Bangle.js2, the GPS module does not have a PSMOO mode, and thus this is emulated using on/off timeouts specified using the update and search options.

- update - the time between two position fix attempts.

- search - the time between two acquisition attempts if the receiver
  is unable to get a position fix.

- fix_req (Bangle.js2 only) - the number of fixes required before the GPS turns off until next search for GPS signal. default is 1.

- adaptive (Bangle.js2 only) - When a GPS signal is acquired, this can reduce the time in seconds until next scan to generate higher temporal resolution of gps fixes. Off if set to 0.
## Module

A module is provided that'll allow you to set GPS configuration from your own
app. To use it:

```
// This will set up the GPS to current saved defaults. It's not normally
// needed unless the watch's battery has run down
require("gpssetup").setPowerMode();

// This sets up the PSMOO mode. update/search/adaptive are optional in seconds
require("gpssetup").setPowerMode({
  power_mode:"PSMOO",
  update:optional (default 120),
  search:optional (default 5),
  adaptive: optional (default 0)
  });

// This sets up SuperE
require("gpssetup").setPowerMode({power_mode:"SuperE"})
```

`setPowerMode` returns a promise, which is completed when the GPS is set up.

So you can for instance do the following to turn the GPS off once it
has been configured:

```
require("gpssetup").setPowerMode().then(function() {
  Bangle.setGPSPower(0);
});
```

**Note:** It's not guaranteed that the user will have installed the `gpssetup`
app/module. It might be worth checking for its existence by surrounding the
`require` call with `try...catch` block.

```
var gpssetup;
try {
  gpssetup = require("gpssetup")
} catch(e) {
  E.showMessage("gpssetup\nnot installed");
}
```

## References

* [UBLOX M8 Receiver Data Sheet](https://www.u-blox.com/sites/default/files/products/documents/u-blox8-M8_ReceiverDescrProtSpec_%28UBX-13003221%29.pdf)

* [UBLOX Power Management App Note](https://www.u-blox.com/sites/default/files/products/documents/PowerManagement_AppNote_%28UBX-13005162%29.pdf)

* Some useful code on Github can be found [here](https://portal.u-blox.com/s/question/0D52p0000925T00CAE/ublox-max-m8q-getting-stuck-when-sleeping-with-extint-pin-control)
and [here](https://github.com/thasti/utrak/blob/master/gps.c)


Written by: [Hugh Barney, with support from Gordon Williams](https://github.com/hughbarney) For support
and discussion please post in the [Bangle JS
Forum](http://forum.espruino.com/microcosms/1424/)
