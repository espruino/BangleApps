# iOS integration app

This is the iOS integration app for Bangle.js. This app allows you to receive
notifications from your iPhone. The Apple Notification Center Service (ANCS)
sends all the messages to your watch.

You can allow this if you connect your Bangle to your iPhone. It will be
prompted for immediatly after you connect the Bangle to the iPhone.

### Setting

Under `Settings -> Apps -> iOS Integration` there is
a `Time Sync` setting. This will enable syncing between the
watch and iOS.

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

### Weather and Calendar

By using the `Shortcuts` app on your phone, you can send weather and calendar data to your watch. This works by sending a notification, which is read by the watch through ANCS. The watch then parses the notification for the data.

While you may write your own shortcuts if you prefer (for example, to get weather from a different source), two are provided:

- Calendar shortcut: https://www.icloud.com/shortcuts/4eac12548b4c424dbcdb1bd58cff338f
- Weather shortcut: https://www.icloud.com/shortcuts/106c68bfac3746fe9a55761a3be8d092

The weather shortcut requires an OpenWeatherMap api key, which you can get for free from https://openweathermap.org/api. The shortcut will prompt you for this when you add it to your phone.

These shortcuts can also be automated to run periodically, for example every hour, using the `Automation` tab in the Shortcuts app.

The shortcuts will send a notification, which can be annoying. One potential workaround for this would be to create a focus mode, and have an automation:
- activate the focus mode (hiding notifications from the shortcut)
- run the shortcut
- deactivate the focus mode


## Requests

Please file any issues on https://github.com/espruino/BangleApps/issues/new?title=ios%20app

## Creator

Gordon Williams
