# Line Dash

A beautiful, swipeable analog clock and stats dashboard for Bangle.js 2. 

Besides the Line Clock, Line Dash provides an additional suite of minimalist gauges that you can swipe through to check your daily stats.

## Features

* **Clock:** A clean, easy-to-read analog clock face.
* **Steps:** Tracks your daily steps using a sweeping dial. 
* **Heart Rate:** Features a color-coded HR Zone gauge. The HR sensor only activates when you swipe to this screen to conserve battery. *(Note: The "Live HR Updates" feature is highly recommended but disabled by default to save power. Be sure to enable it in the app settings!)*
* **Battery:** Displays your current battery level.

## Controls

* **Swipe Left / Right:** Cycle through the different dashboard gauges.
* **Tap:** Cycle forward to the next gauge.

## Customization

The app includes a comprehensive settings menu where you can configure the following options:

* **Show Lock:** Display a padlock icon when the screen is locked.
* **Show Minute:** Toggle the digital minute display in the center of the clock gauge.
* **24 Hour Labels:** When enabled, the clock gauge will dynamically relabel its ticks to 24-hour format (13, 14, 15...) during the afternoon.
* **Show Steps:** Enable or disable the Steps gauge screen.
* **Steps "k" label:** Toggle the "k" (thousands) suffix on the Steps gauge.
* **Show Battery:** Enable or disable the Battery gauge screen.
* **Dynamic Battery Color:** When enabled, the battery gauge gradually turns red when battery runs low.
* **Show Heart Rate:** Enable or disable the Heart Rate gauge screen.
* **Live HR Updates:** Toggle whether the Heart Rate gauge updates live while viewing it.
* **Live HR Interval:** If Live HR is enabled, select how often the gauge redraws (2s, 5s, 15s, 30s, 60s, 90s, or 120s).
* **HR Age Decade:** Select your age decade (20s, 30s, 40s, 50s, 60s, 70s, or 80s) to accurately calculate your Max HR and corresponding HR Zones.

## Credits

Line Dash was built upon the foundation of the [Line Clock](https://github.com/espruino/BangleApps/tree/master/apps/line_clock) app originally created by deepDiverPaul. We took the original minimalist line aesthetic and expanded it into a suite of interactive, swipeable dashboard gauges.
