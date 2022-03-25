# Clock & Calendar by Michael

This is my "Hello World". I first made this watchface almost 10 years ago for my original Pebble and Pebble Time and I missed this so much, that I had to write it for the BangleJS2.
I know that it seems redundant because there already **is** a *time&cal*-app, but it didn't fit my style.

|Screenshot|description|
|:--:|:-|
|![locked screen](screenshot.png)|locked: triggers only one minimal update/min|
|![unlocked screen](screenshot2.png)|unlocked: smaller clock, but with seconds|
|![big calendar](screenshot3.png)|swipe up for big calendar, (up down to scroll, left/right to exit)|

## Configurable Features
- Number of calendar rows (weeks)
- Buzz on connect/disconnect (I know, this should be an extra widget, but for now, it is included)
- Clock Mode (24h/12h). (No am/pm indicator)
- First day of the week
- Red Saturday/Sunday
- Swipe/Drag gestures to launch features or apps.

## Auto detects your message/music apps:
- swiping down will search your files for an app with the string "message" in its filename and launch it. (configurable)
- swiping right will search your files for an app with the string "music" in its filename and launch it. (configurable)

## Feedback
The clock works for me in a 24h/MondayFirst/WeekendFree environment but is not well-tested with other settings.
So if something isn't working, please tell me: https://github.com/foostuff/BangleApps/issues

## Planned features:
 - Internal lightweight music control, because switching apps has a loading time.
 - Clean up settings
 - Maybe am/pm indicator for 12h-users
 - Step count (optional)
