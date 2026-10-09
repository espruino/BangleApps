# BlueWatch
This adds support for deeper iOS integration using the native [BlueWatch iOS app](https://apps.apple.com/us/app/bluewatch-for-bangle-js/id6769088559).

The app is built from the ground up to support Bangle.js, and features many more capabilities than the base `iOS integration` app.

The BlueWatch iOS app is open-source, and anyone can contribute or suggest new features [here](https://github.com/rkboss6/bluewatch).

For any questions, comments, or concerns, please reach out to the author (RKBoss6) by filing an issue in the [BlueWatch GitHub Repository](https://github.com/rkboss6/bluewatch).

Bangle.js 1 support coming soon!

## Features
- Automatic location updates to `mylocation.json` without any additional setup
- Automatic weather updates without any additional setup
- Find my phone support
- Use of the phone's GPS for Bangle.js GPS.
- Sending and storing of heart rate, steps, battery, and active/resting calories (if installed) to Apple Health/BlueWatch app
- Syncing of time from phone to watch

Additionally, the iOS app provides shortcuts actions to create your own workflows and automations. By hooking into when BlueWatch receives a message (see developer info), you can send messages through shortcuts that your watch receives and handles. This allows you to create complex workflows such as: 
- When you reach home, alert your watch to change the clock to an inexact clock face to relax
- When CarPlay is connected to your car, send a message to your watch to turn on quiet mode for driving
- When you receive a message from a specific person, vibrate continuously so you never miss the message

**Note:** This app still uses the `iOS Integration app` to handle pushing notifications from the phone to the watch.

## Get Started:
To get started, first download and install the [BlueWatch iOS app](https://apps.apple.com/us/app/bluewatch-for-bangle-js/id6769088559) on your iPhone.

Then, follow the app instructions and authorize Bluetooth permissions for the app to work. The app will then automatically scan for your Bangle. Make sure Bluetooth is turned on and in the range of your iPhone.

After it pairs, it will automatically push weather and location data to the watch. You can turn these features off in the iOS app's settings menu.

For more documentation, please see the [iOS App's README](https://github.com/RKBoss6/BlueWatch/blob/main/README.md)
## Developer Info
Upon connect, the module sends an event `"BlueWatchConnected"` which can be listened for using the following:
```
Bangle.on("BlueWatchConnected", function (){ ... })
```

To send a string or a JSON, you can use the following: 
```
require("bluewatch").sendData("string or object", true);
```
with an optional second parameter `forceSend`. When true, it sends even if BlueWatch is not connected at the time. By default it doesn't send info unless the device handshake is completed and BlueWatch is connected

In the iOS app version 1.4, you can also use the Shortcuts app to send custom messages to the watch, as well as checking connection, and pushing weather/location via shortcuts. In the Bangle app version v0.04, the watch will emit the `BlueWatchMessage` event when a new message is received, allowing you to create your own workflows and automations using shortcuts and a receiving script:
```
Bangle.on("BlueWatchMessage", (message) => {
    // your receiving code here
});
```
## Author and Creator of the iOS App
RKBoss6

