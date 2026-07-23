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
## Author and Creator of the iOS App
RKBoss6

