# Line Dash

A beautiful analog clock with swipeable stats dashboards for Bangle.js 2.

Line Dash provides a suite of minimalist gauges that you can swipe through to check your daily stats. It features a clean design where each metric gets its own dedicated screen, keeping your main clock face completely uncluttered. The app is intentionally full-screen and does not display widgets.

## Screenshots

| Clock | Heart Rate | Steps | Battery |
| :---: | :---: | :---: | :---: |
| ![](app-screenshot-clock.png) | ![](app-screenshot.png) | ![](app-screenshot-step.png) | ![](app-screenshot-bat.png) |

## Features

* **Clock:** A clean, easy-to-read analog clock face that automatically inherits your system's 12/24 hour preference. Swipe up or down to briefly show the date (weekday and day/month, following your system language).
* **Steps:** Tracks your daily steps using a sweeping dial.
* **Distance:** A trip meter that displays distance covered. Swiping up or down resets it to zero! *(Note: the trip baseline is not persisted — leaving the app resets the trip meter to the full daily distance.)*
* **Heart Rate:** Features a color-coded HR Zone gauge. The HR sensor only activates when you swipe to this screen to conserve battery. *(Note: The "Live HR Updates" feature is highly recommended but disabled by default to save power. Be sure to enable it in the app settings!)*
* **Battery:** Displays your current battery level in a classic 180-degree "fuel gauge" layout. When you plug in your watch, the app automatically switches to this dashboard and displays a dynamic green charging indicator. Unplugging it automatically returns you to the main clock!

## Controls

* **Swipe Left / Right:** Cycle through the different dashboard gauges.
* **Tap:** Cycle forward to the next gauge.
* **Swipe Up / Down (Clock):** Shows the date for a few seconds; swipe again to dismiss it early.
* **Swipe Up / Down (Distance):** Resets the Distance gauge trip meter to zero.

## Customization

The app includes a comprehensive settings menu where you can configure the following options:

* **Show Lock:** Display a padlock icon when the screen is locked.
* **Show Minute:** Toggle the digital minute display in the center of the clock gauge.
* **Distance Unit:** Manually override the distance unit to `km` or `mi`.
* **Show Distance:** Enable or disable the Distance Trip Meter screen.
* **Stride (m):** Set your personal stride length (0.40m to 1.20m) for accurate distance calculation.
* **Show Steps:** Enable or disable the Steps gauge screen.
* **Show Battery:** Enable or disable the Battery gauge screen.
* **Show Heart Rate:** Enable or disable the Heart Rate gauge screen.
* **Live HR Updates:** Toggle whether the Heart Rate gauge updates live while viewing it.
* **Live HR Interval:** If Live HR is enabled, select how often the gauge redraws (2s, 5s, 15s, 30s, 60s, 90s, or 120s).
* **HR Age Decade:** Select your age decade (20s, 30s, 40s, 50s, 60s, 70s, or 80s) to accurately calculate your Max HR and corresponding HR Zones.

## Credits

Line Dash was created by [pagnotta](https://github.com/pagnotta), built upon the foundation of the [Line Clock](https://github.com/espruino/BangleApps/tree/master/apps/line_clock) app originally created by deepDiverPaul. It has been expanded into a suite of interactive, swipeable dashboard gauges.

## License

This app is released under the [MIT License](LICENSE).
