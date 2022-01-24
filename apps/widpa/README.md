# Simple Pedometer Widget

*Displays the current step count from `Bangle.getHealthStatus("day").steps` in (6x8,2) font, Requires firmware v2.11.21 or later*

* Designed to be small, minimal, does one thing well, no settings
* Supports Bangle 1 and Bangle 2

## Notes

* Requires firmware v2.11.21 or later
* `Bangle.getHealthStatus("day").steps` is reset to zero if you reboot your watch with a long BTN Press
* The step count displayed may be a few steps more than that reported by widpedpm as widpedom may not always be loaded.

![](screenshot_widpa.png)

Written by: [Hugh Barney](https://github.com/hughbarney)  For support and discussion please post in the [Bangle JS Forum](http://forum.espruino.com/microcosms/1424/)
