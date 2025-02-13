# DayMoon Circadian
This started out with a goal to recreate the Pebble [Fair Circadian watchface](https://setpebble.com/app/fair-circadian) by  Matthew Clark for the Bangle.js2.
It ended up with me making a mostly new watchface that has the moon phase more prominent, but keeps the single dial 24 hour clock with daylight and sunset highlighted.

This uses the myLocation app to get your latitude and longitude for proper daylight calculations. If your location isn't set in that app, it will default to Nashua, NH. If your sunrise/sunset times aren't making sense, check that first!

## Future Development
Feature roadmap:
 - [x] 0.01 Fix blocking widgets
 - [x] 0.03 Day and Night different color markers
 - [x] 0.04 Add to App Loader
 - [x] 0.05 Add more screenshots with different moon phases
 - [ ] 0.06 add Day of week and month display
 - [ ] 0.07 Seconds display
 - [ ] 0.08 Color Themes (and settings/options)
 - [ ] 0.09 Moon display angle represents how it looks in the sky
 - [ ] 0.10 custom/bigger/fitted time digits 
 - [ ] 0.20 clockinfo support?
 - [ ] 0.30 Tap/swipe actions?
 