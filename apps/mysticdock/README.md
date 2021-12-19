# Mystic Dock for Bangle.js

A retro-inspired dockface that displays the current time and battery charge while plugged in, and which features an interactive mode that shows the time, date, and a rotating data display line.

## Features

- Screensaver-like dock mode while charging (displays the current time for 8 seconds and a blank screen for 2, changing text placement with each draw)
- 24 or 12-hour time (adjustable via the Settings menu)
- Variable colors (also in the Settings)
- Interactive watchface display (use upper and lower watch-buttons to activate it and rotate between values at the bottom)
- International localization of watchface date (which can be disabled via the Settings if memory becomes an issue)
- Automatic watchface reload when unplugged (toggleable via the Settings menu)
- Rotates display 90 degrees if it detects it is sideways (for use in a charging dock)

When in interactive display mode, the bottom line rotates between the following items:

- Current time zone
- Battery charge level
- Device ID (derived from the last 4 of the MAC)
- Memory usage
- Firmware version


## Inspirations

- [Bluetooth Dock](https://github.com/espruino/BangleApps/tree/master/apps/bluetoothdock)
- [CLI Clock](https://github.com/espruino/BangleApps/tree/master/apps/cliock)
- [Dev Clock](https://github.com/espruino/BangleApps/tree/master/apps/dclock)
- [Digital Clock](https://github.com/espruino/BangleApps/tree/master/apps/digiclock)
- [Simple Clock](https://github.com/espruino/BangleApps/tree/master/apps/sclock)
- [Simplest Clock](https://github.com/espruino/BangleApps/tree/master/apps/simplest)

Icon adapted from [this one](https://publicdomainvectors.org/en/free-clipart/Digital-clock-display-vector-image/10845.html) and [this one](https://publicdomainvectors.org/en/free-clipart/Vector-image-of-power-manager-icon/20141.html) from [Public Domain Vectors](https://publicdomainvectors.org).


## Changelog

- 1.00: First published version. (June 2021)


## Author

Eric Wooodward https://itsericwoodward.com/
