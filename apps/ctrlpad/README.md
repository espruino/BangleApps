# Description

A control pad app to provide fast access to common functions, such as bluetooth power, HRM and Do Not Disturb.
By dragging from the top of the watch, you have this control without leaving your current app (e.g. on a run, bike ride or just watching the clock).

The app is designed to not conflict with other gestures - when the control pad is visible, it'll prevent propagation of events past it (touch, drag and swipe specifically). When the control pad is hidden, it'll ignore touch, drag and swipe events with the exception of an event dragging from the top 40 pixels of the screen.


# Usage

Swipe down to enable and observe the overlay being dragged in. Swipe up on the overlay to hide it again. Then tap on a given button to trigger it.

Requires espruino firmware > 2v17 to avoid event handler clashes.


# Setup / Technical details

The control pad disables drag and touch event handlers while active, preventing other apps from interfering.


# Todo

- Handle rotated screen (`g.setRotation(...)`)
- Handle notifications (sharing of `setLCDOverlay`)
