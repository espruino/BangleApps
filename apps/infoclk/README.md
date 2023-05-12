# Informational clock

A configurable clock with extra info and shortcuts when unlocked, but large time when locked

## Information

The clock has two different screen arrangements, depending on whether the watch is locked or unlocked. The most commonly viewed piece of information is the time, so when the watch is locked it optimizes for the time being visible at a glance without the backlight. The hours and minutes take up nearly the entire top half of the display, with the date and seconds taking up nearly the entire bottom half. The day progress bar is between them if enabled, unless configured to be on the bottom row. The bottom row can be configured to display a weather summary, step count, step count and heart rate, the daily progress bar, or nothing.

When the watch is unlocked, it can be assumed that the backlight is on and the user is actively looking at the watch, so instead we can optimize for information density. The bottom half of the display becomes shortcuts, and the top half of the display becomes 4 rows of information (date and time, step count and heart rate, 2 line weather summary) + an optional daily progress bar. (The daily progress bar can be independently enabled when locked and unlocked.)

Most things are self-explanatory, but the day progress bar might not be. The day progress bar is intended to show approximately how far through the day you are, in the form of a progress bar. You might want to configure it to show how far you are through your waking hours, or you might want to use it to show how far you are through your work or school day.

## Shortcuts

There are generally a few apps that the user uses far more frequently than the others. For example, they might use a timer, alarm clock, and calculator every day, while everything else (such as the settings app) gets used only occasionally. This clock has space for 8 apps in the bottom half of the screen only one tap away, avoiding the need to wait for the launcher to open and then scroll through it. Tapping the top of the watch opens the launcher, eliminating the need for the button (which still opens the launcher due to bangle.js conventions). There is also handling for left, right, and vertical swipes. A vertical swipe by default opens the messages app, mimicking mobile operating systems which use a swipe down to view the notification shade.

## Configurability

Dual stage unlock allows for unlocking to be split into two stages: lighting the screen upon the actual unlock, and displaying the extra information and shortcuts after a user-configurable number of taps. This may be useful if you want to quickly glance at the clock with a wrist flick in the dark, or if you want to show the time to other people. Swipe shortcuts are active even after the first stage.

Displaying the seconds allows for more precise timing, but waking up the CPU to refresh the display more often consumes battery. The user can enable or disable them completely, but can also configure them to be enabled or disabled automatically based on some hueristics:

* They can be hidden while the display is locked, if the user expects to unlock their watch when they need the seconds.
* They can be hidden when the battery is too low, to make the last portion of the battery last a little bit longer.
* They can be hidden during a period of time such as when the user is asleep and therefore unlikely to need very much precision.

The date format can be changed.

As described earlier, the contents of the bottom row when locked can be changed.

The 8 tap-based shortcuts on the bottom and the 3 swipe-based shortcuts can be changed to nothing, the launcher, or any app on the watch.

The start and end time of the day progress bar can be changed. It can be enabled or disabled separately when the watch is locked and unlocked. The color can be changed. The time when it resets from full to empty can be changed.

When the battery is below a defined point, the watch's color can change to another chosen color to help the user notice that the battery is low.