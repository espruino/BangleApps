# iOS integration app

This is the iOS integration app for Bangle.js. This app allows you to receive
notifications from your iPhone. The Apple Notification Center Service (ANCS)
sends all the messages to your watch.

You can allow this if you connect your Bangle to your iPhone. It will be
prompted for immediatly after you connect the Bangle to the iPhone.

### Setting

Under `Settings -> Apps -> iOS Integration` there are some settings:

* `Time Sync` - This will enable syncing between the watch and iOS.
* `Disable UTF8` - As of version 0.17 of this app, text strings from iOS
are treated as UTF8. If you install a font library like https://banglejs.com/apps/?id=fontsall
then the messages app will be able to use that to render characters from iOS. Without fonts
installed, non-european (ISO8859-1) characters won't be displayed. If `Disable UTF8`
is true *or no fonts library is installed*, text from iOS is converted to ISO8859-1, and known characters with equivalents
within that range are converted (so text will display without a font library).

### Connecting your Bangle.js to your iPhone

The Bangle watches are Bluetooth Low Energy (BLE) devices. Sometimes they
will not be seen/detected by the Bluetooth scanner in your iPhone settings
menu.

To resolve this, you can download an app that can actually scan
for BLE devices. There are great ones out there, free and paid.

We really like WebBLE, which we also recommend to load apps on your
watch with your iOS device, as Safari does not support WebBluetooth
for now. It's just a few bucks/pounds/euro's.

If you like to try a free app first, you can always use NRF Toolbox or
Bluetooth BLE Device Finder to find and connect your Bangle.

### Weather, Calendar, and Location

By using the `Shortcuts` app on your phone, you can send weather, calendar, and location data to your watch. This works by sending a notification, which is read by the watch through ANCS. The watch then parses the notification for the data.

While you may write your own shortcuts if you prefer (for example, to get weather from a different source), three are provided:

- [Calendar shortcut](https://www.icloud.com/shortcuts/4eac12548b4c424dbcdb1bd58cff338f)
- [Weather shortcut](https://www.icloud.com/shortcuts/73be0ce1076446f3bdc45a5707de5c4d)
- [Location shortcut](https://www.icloud.com/shortcuts/853c41e09a8e491f893a63b464d73ea1)

Note: The shortcuts must keep the names defaulted by the shortcut in order for the watch to detect the weather, calender, or location data. If you rename it from `BangleDump...` to something else, it will no longer get the info, and just display it as a notification on the watch.

These shortcuts can also be automated to run periodically, for example every hour, using the `Automation` tab in the Shortcuts app.

The shortcuts will send a notification. Even though the notification is deleted as soon as Bangle.js receives it, it can be quite annoying. One potential workaround for this would be to create a focus mode, and have an automation:
- activate the focus mode (hiding notifications from the shortcut)
- run the shortcut
- deactivate the focus mode


## Requests

Please file any issues on https://github.com/espruino/BangleApps/issues/new?title=ios%20app

## Creator

- Gordon Williams

## Contributors

- RKBoss6
- stweedo
