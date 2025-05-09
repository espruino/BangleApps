# Umpire Ball Counter
*Cricket umpire ball counter and match event logger for Bangle.js 2 hackable smart watch*
## Background
There are a few ways to keep track of balls when umpiring a cricket match. These vary from the rudimentary - having some stones in your pockets and transferring them from one side to the other - to the "modern" umpire's clicker. The latter allows you to track fairly delivered balls, overs completed and wickets fallen.

In addition, the umpire needs to know the time and to record particular events like when "Play" was called or when a fielder left the field. These events are written down on paper.

This app is designed to replace the clicker, and keep track of events for analysis and reporting after each match.

## Objectives ##

The app aims to achieve three broad objectives:
1. Count how many balls and wickets have been logged, and show the current over number and time of day.
2. Log these and other events with a timestamp, and a duration since the last timestamp.
3. Allow the data logged to be viewed on the watch and on a BLE-paired mobile device as structured data.

## Modules ##

The app is split into three screens shown to the umpire on the watch:
1. Main Menu
2. In-play Screen
3. Log viewer

There an additional module to allow settings to be changed via the watch Settings menu. The number of balls in the over and the number of overs in the innings are configurable, so that 15 eight-ball overs, T20, 40-50 over and The Hundred can all be supported.

A further module of the app is a web page used to access the log file from the app store.

## Interaction ##

Bangle.js 2 app interactions are enabled and constrained by the Bangle and Espruino (E) libraries. This app uses the following patterns:

### Swipe and Button ###

The in-play screen detects swipe and button events using Bangle.setUI. This appears reliable. 

When in-play, use of the button increments the (fairly delivered) ball count. The app does not suppress the screen lock so by default it requires the umpire to press once to unlock the watch and a second press to log the ball. Bangle.buzz is used to give positive feedback when the app takes action so that the screen does not need to be looked at.

After logging the third-to-last ball in the over, the app buzzes twice. This is typically when the umpire needs to check the balls remaining with the other umpire, in case they have not logged every fair delivery.

After the second-to-last ball the app gives one long buzz to remind the umpire that the next ball will close the over (if fairly delivered).

Logging the final ball triggers the change of over. When the last over of the innings is complete the screen shows "END" but allows play to continue to be logged until the new innings is triggered.

Whilst the in-play screen is displayed swiping will cause the following actions to occur:
- **Swipe Up** performs the same action as the Button press.
- **Swipe Down** decrements the ball count and logs the action as a "Correction".
- **Swipe Right** shows the log viewer. 
- **Swipe Left** shows the main menu.

### Confirmation Prompts ###

When choosing "Wicket" or "Recall" from the main menu E.showPrompt is used to ask for positive confirmation before incrementing or decrementing the wickets, respectively, and then to increment or decrement the ball count. This has relatively small tap targets on the Bangle.js 2 screen but appears stable.

### Scrollers ###

The main menu, the "Toss" sub-menu and log viewer all use E.showScroller to display a scrollable list of tappable items. This is in preference to E.showMenu which, at the time of writing, has bugs affecting where the touch event is detected in the list of menu items (one lower than it should).

Whenever a scroller is shown, the in-play swipe interactions are switched off.

Tapping on the log viewer returns the umpire to the in-play screen.

### Twist to refresh ###

The app uses Bangle.twist to detect the umpire turning their wrist to view the screen and, when the in-play screen is active, will refresh the current time and elapsed time since the last ball.

Showing the elapsed time since the last ball was logged helps the umpire to assess whether either team is timewasting and whether a new batter has made it to the crease as required by the laws.

## Timing ##

The app calculates three durations:
1. **Ball to ball** - When logging a ball the elapsed time since the last logged ball.
2. **Overs** - When logging the last ball of the over, the elapsed time since the last ball of the previous over was logged (or when "Play" was initially called).
3. **Lost Time** - When logging a call of "Play" after a call of "Time" the elapsed time since the call of "Time".
