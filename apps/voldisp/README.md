# Display Volume for Android

Display the media volume of your android device when it's changed. A bar shows up at the top of your Bangles screen. (Needs recent Gadgetbridge nightly or stable ver. 85 once out)

## Notes

- Widgets may redraw on top of the volume bar. There was an effort to mitigate this, but the code complexity was annoying.
  - This is however preserved in the git history (by revert commits) so can be brought back by reverting (revert the revert commits...) if needed.
- Indicator might appear laggy or to not update continuously.
  - There seems to be a limitation to how often Gadgetbridge can send send the volume info from the Android device - when it's in the background (most of the time). If Gadgetbridge is in the foreground on Android the volume bar on the Bangle updates almost as fast as the one on the Android device itself.

## Contributors

thyttan

