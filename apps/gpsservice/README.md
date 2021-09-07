# GPS Service

A configurable, low power GPS widget that runs in the background.

NOTE: This app has been superceded by [gpssetup](https://github.com/espruino/BangleApps/blob/master/apps/gpssetup/README.md)


## Goals

To develop a low power GPS widget that runs in the background and to
facilitate an OS grid reference display in a watch face.


* An app that turns on the GPS and constantly displays the screen
  will use around 75mA, the battery will last between 3-4 hours.

* Using the GPS in a Widget in Super-E Power Saving Mode (PSM) with
  the screen off most of the time, will consume around 35mA and you
  might get 10hrs before a recharge.
  
* Using the GPS in Power Saving Mode On/Off (PSMOO) with suitable
  settings can reduce the average consumption to around 15mA.  A
  simple test using a 120s update period, 6s search period was still
  running with 45% battery 20 hours after it started.


## Settings

The Settings App enables you set the following options for the GPS
Service.  Go to Settings, select App/Widgets and then 'GPS Service'.

- GPS - On/Off.  When this value is changed the GPS Service will be
  powered on or off and the GPS Widget will be displayed.

- Power Mode:

   - SuperE - the factory default setup for the GPS. The recommended
   power saving mode.

   - PSMOO - On/Off power saving mode. Configured by interval and
   search time. Choose this mode if you are happy to get a GPS
   position update less often (say every 1 or 2 minutes). The longer
   the interval the more time the GPS will spend sleeping in low
   power mode (7mA) between obtaining fixes (35mA).  For walking in
   open country an update once every 60 seconds is adequate to put
   you within a 6 digit grid refernce sqaure.

- update - the time between two position fix attempts.

- search - the time between two acquisition attempts if the receiver
  is unable to get a position fix.



## Screenshots
### GPS Watch face

* The Age value is the number of seconds since the last position fix was received.

![](gps_face.jpg)

### Grid Reference Watch face

* The time shown is the timestamp of the last position fix.
* The age value is shown at the bottom of the screen. 

![](osref_face.jpg)

## Interface for Apps

The code below demonstrates how you can setup and start the gpsservice from your own App.

```js
function test_gps_on() {

  var settings = WIDGETS.gpsservice.gps_get_settings();

  // change the settings to what you require
  settings.gpsservice = true;
  settings.update = 65;
  settings.search = 5;
  settings.power_mode = "PSMOO";
  
  WIDGETS.gpsservice.gps_set_settings(settings);
  WIDGETS.gpsservice.reload(); // will power on
}
```

In your app can retrieve the last fix as and when required.

```js
var fix = {
  fix: 0,
  alt: 0,
  lat: 0,
  lon: 0,
  speed: 0,
  time: 0,
  satellites: 0
};

// only attempt to get gps fix if gpsservice is loaded
if (WIDGETS.gpsservice !== undefined) {
  fix = WIDGETS.gpsservice.gps_get_fix();
  gps_on = WIDGETS.gpsservice.gps_get_status();
}

if (fix.fix) {
  var time = formatTime(fix.time);
  var age = timeSince(time);
```

When done you can turn the gpsservice off using the code below.

```js
function test_gps_off() {

  var settings = WIDGETS.gpsservice.gps_get_settings();

  settings.gpsservice = false;
  settings.power_mode = "SuperE";
  
  WIDGETS.gpsservice.gps_set_settings(settings);
  WIDGETS.gpsservice.reload(); // will power off
}
```

## To Do List
* add a logging option with options for interval between log points
* add graphics and icons to the watch faces to make them look nicer


## References

* [UBLOX M8 Receiver Data Sheet](https://www.u-blox.com/sites/default/files/products/documents/u-blox8-M8_ReceiverDescrProtSpec_%28UBX-13003221%29.pdf)

* [UBLOX Power Management App Note](https://www.u-blox.com/sites/default/files/products/documents/PowerManagement_AppNote_%28UBX-13005162%29.pdf)

* Some useful code on Github and be found [here](https://portal.u-blox.com/s/question/0D52p0000925T00CAE/ublox-max-m8q-getting-stuck-when-sleeping-with-extint-pin-control)
and [here](https://github.com/thasti/utrak/blob/master/gps.c)

