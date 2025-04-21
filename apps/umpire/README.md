# Umpire Ball Counter
*Cricket umpire ball counter and match event logger for Bangle.js 2 hackable smart watch*
## Background
There are a few ways to keep track of balls when umpiring a cricket match. These vary from the rudimentary - having some stones in your pockets and transferring them from one side to the other - to the "modern" umpire's clicker. The latter allows you to track fairly delivered balls, overs completed and wickets fallen.

In addition, the umpire needs to know the time and to record particular events like when "Play" was called or when a fielder left the field. These events are written down on paper.

Of note is that umpires do not keep score, and to try and keep score is considered detrimental to achieving the umpire's other duties on the field.

The purchase of my watch and the building of this app were a direct result of wanting to improve on the "modern" clicker whilst making post-match reports easier to write for myself as an aspiring umpire.

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

## Interaction ##

Bangle.js 2 app interactions are enabled and constrained by the Bangle and Espruino (E) libraries. This app uses the following patterns:

### Swipe and Button ###

The in-play screen detects swipe and button events using Bangle.setUI. This appears reliable. 

When in-play, use of the button increments the (fairly delivered) ball count. The app does not suppress the screen lock so by default it requires the umpire to press once to unlock the watch and a second press to log the ball. Bangle.buzz is used to give positive feedback when the app takes action so that the screen does not need to be looked at.

After logging the 4th ball in the over, the app buzzes twice. This is typically when the umpire needs to check the balls remaining with the other umpire, in case they have not logged every fair delivery.

After the 5th ball the app gives one long buzz to remind the umpire that the next ball will close the over (if fairly delivered).

Logging the 6th ball triggers the log viewer so that the umpire can check the over duration and innings duration.

Whilst the in-play screen is displayed swiping will cause the following actions to occur:
- **Swipe Up** performs the same action as the Button press.
- **Swipe Down** decrements the ball count and logs the action as a "Correction".
- **Swipe Right** shows the log viewer. 
- **Swipe Left** shows the main menu.

### Confirmation Prompts ###

When choosing "Wicket" or "Recall" from the main menu E.showPrompt is used to ask for positive confirmation before incrementing or decrementing the wickets, respectively. This has relatively small tap targets on the Bangle.js 2 screen but appears stable.

### Scrollers ###

The main menu, the "Toss" sub-menu and log viewer all use E.showScroller to display a scrollable list of tappable items. This is in preference to E.showMenu which, at the time of writing, has bugs affecting where the touch event is detected in the list of menu items (one lower than it should).

Whenever a scroller is shown, the in-play swipe interactions are switched off.
