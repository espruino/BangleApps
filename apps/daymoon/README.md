# DayMoon Circadian
This started out with a goal to recreate the Pebble [Fair Circadian watchface](https://setpebble.com/app/fair-circadian) by  Matthew Clark for the Bangle.js2.
It ended up with me making a mostly new watchface that has the moon phase more prominent, but keeps the single dial 24 hour clock with daylight and sunset highlighted.

This uses the myLocation app to get your latitude and longitude for proper daylight calculations. If your location isn't set in that app, it will default to Nashua, NH. If your sunrise/sunset times aren't making sense, check that first!

## Future Development
Feature roadmap:
 - [x]0.1.1 Fix blocking widgets
 - [x]0.1.2 Day and Night different color markers
 - [ ]0.2 add Day of week and month display
 - [ ]1.0 Seconds display
 - [ ]1.1 Color Themes (and settings/options)
 - [ ]1.2 Moon display angle represents how it looks in the sky
 - [ ]1.3 custom/bigger/fitted time digits 
 - [ ]2.0 clockinfo support?
