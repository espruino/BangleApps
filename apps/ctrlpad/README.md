# Description

A control pad app to provide fast access to common functions, such as bluetooth power, HRM and Do Not Disturb.
By dragging from the top of the watch, you have this control without leaving your current app (e.g. on a run, bike ride or just watching the clock).


# Usage

Swipe down to enable and observe the overlay being dragged in. Swipe up on the overlay to hide it again. Then tap on a given button to trigger it.

Requires espruino firmware > 2v17 to avoid event handler clashes.


# Setup / Technical details

The control pad disables drag and touch event handlers while active, preventing other apps from interfering.
