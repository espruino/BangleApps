# Line Dash

A clean, swipeable analog dashboard for Bangle.js 2. 

Line Dash provides a suite of minimalist gauges that you can swipe through to check your daily stats. It is designed to minimize battery drain by only powering sensors when their specific gauge is visible on the screen.

## Features

* **Clock:** A clean, easy-to-read analog clock face.
* **Steps:** Tracks your daily steps using a sweeping dial. 
* **Battery:** Displays your remaining battery life on a 7-to-5 o'clock dial.
* **Heart Rate:** Features a live, color-coded HR Zone gauge. The HR sensor only activates when you swipe to this screen to conserve battery. 

## Controls

* **Swipe Left / Right:** Cycle through the different dashboard gauges.
* **Tap:** Cycle forward to the next gauge.

## Customization

The app includes a comprehensive settings menu where you can configure the following options:

* **Show Lock:** Display a padlock icon when the screen is locked.
* **Show Minute:** Toggle the digital minute display in the center of the clock gauge.
* **Show Steps:** Enable or disable the Steps gauge screen.
* **Steps "k" label:** Toggle the "k" (thousands) suffix on the Steps gauge.
* **Show Battery:** Enable or disable the Battery gauge screen.
* **Dynamic Battery Color:** When enabled, the battery gauge turns red when battery is low.
* **Show Heart Rate:** Enable or disable the Heart Rate gauge screen.
* **Live HR Updates:** Toggle whether the Heart Rate gauge updates live while viewing it.
* **Live HR Interval:** If Live HR is enabled, select how often the gauge redraws (2s, 5s, 15s, 30s, 60s, 90s, or 120s).
* **HR Age Decade:** Select your age decade (20s, 30s, 40s, 50s, 60s, 70s, or 80s) to accurately calculate your Max HR and corresponding HR Zones.

## Credits

Line Dash was built upon the foundation of the [Line Clock](https://github.com/espruino/BangleApps/tree/master/apps/line_clock) app originally created by deepDiverPaul. We took the original minimalist line aesthetic and expanded it into a suite of interactive, swipeable dashboard gauges.
