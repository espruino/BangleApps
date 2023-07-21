# GPS Scramble

This app wraps the existing [GPS recorder] and "scrambles" the GPS recording so, if lost, a read of the GPS files on the watch won't give away your home, work or other locations.

## Tech

The scrambling works by shifting your GPS records so they start in the middle of the pacific ocean, making it very difficult for someone to attempt to guess where the GPS track originated. To restore your track, the recorder app can unscramble these coordinates when provided with the starting location for your track.

The constraints on this design are:
- Avoid needing to enter a password whenever the watch loads
- Avoid storing true GPS coordinates (to prevent SWD reads)
- Avoid heavy crypto
- Avoid reliance on an external device, e.g. a phone

## Discussion

Initial discussion took place on the [espruino forum](https://forum.espruino.com/conversations/388489/).

[GPS recorder]: https://github.com/espruino/BangleApps/blob/0eea248390f5245c8d5bceb3eb2e976fab193a45/apps/recorder/widget.js#L22-L58
