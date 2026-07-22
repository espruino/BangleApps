# Line Dash

A beautiful analog clock with swipeable stats dashboards for Bangle.js 2.

Line Dash provides a suite of minimalist gauges that you can swipe through to check your daily stats. Each metric gets its own dedicated full-screen dial, keeping the clock face completely uncluttered. The app is intentionally full-screen and does not display widgets.

## Screenshots

| Clock | Heart Rate | Steps | Battery |
| :---: | :---: | :---: | :---: |
| ![](app-screenshot-clock.png) | ![](app-screenshot.png) | ![](app-screenshot-step.png) | ![](app-screenshot-bat.png) |

## The Gauges

Swipe **left/right** to cycle through the gauges. Swipe **up/down** to climb into and out of a gauge's sub-views. A **tap** shows the exact value of what you are looking at (or the date, on the clock) for a few seconds.

* **Clock** — analog face, following your system's 12/24 hour setting, with the digital minute in the center.
  * Tap: date overlay (weekday and day/month, in your system language).
  * Swipe up: the timer sub-view.
  * While a timer runs, a small red marker sits on the dial where the hand will be when it fires — like the bezel of a diver's watch. It is hollow while the timer is paused.
* **Timer** — a kitchen timer on a minute dial, one revolution per hour.
  * Tap: opens the menu — hours and minutes, up to 23:59 — and Start begins the countdown (the circle shows START while a duration is waiting to go).
  * Swipe up: pause. Swipe up on a paused timer: RESET? popup, one more swipe up confirms.
  * Swipe down: resume, or climb back to the clock face (the timer keeps running).
  * Tap on a running or paused timer: exact remaining time, counting down live.
  * The circle counts down the minutes, then the seconds in the final minute — also while the watch is locked. Beyond an hour the dial wraps (like the altimeter) and the circle shows the remaining hours: at 4:55 left, the needle reads 55 and the circle 4.
  * Colors: the clock's white/red while running, magenta (with a pause icon) while paused or stopped.
  * The ringing is handled by the system scheduler: the standard alarm screen (buzz, snooze, dismiss) fires even if a message or another app has taken over the screen — and even after a reboot.
* **Steps** — your daily steps on a sweeping dial.
  * Swipe up: the distance covered today (derived from steps and stride length); swipe up again: the trip meter.
  * The trip counts "from here": entering it starts one, swipe up in the trip view asks to reset it (RESET? popup). It keeps running in the background, is marked with a TRIP indicator, and ends automatically at midnight.
  * Swipe down: climb back — trip → distance → steps — without resetting anything.
* **Heart Rate** — a color-coded HR-zone gauge, with zones derived from your age decade.
  * The sensor only runs while this screen is shown, to conserve battery.
  * The gauge updates live while you watch it (interval and on/off configurable in the settings).
* **Battery** — a classic 180-degree fuel gauge with fixed color zones: green above 30%, a yellow warning band down to 15%, red reserve below.
  * Plugging in the charger switches to this gauge automatically and shows a green charging bolt; unplugging returns you to the clock.
* **Barometer** — air pressure on a 300-degree 950-1050 hPa dial; the dial gives the hundreds, the circle the last two digits ("13" for 1013 hPa).
  * Tap: exact reading.
  * Swipe up: the altimeter sub-view, laid out like an aircraft altimeter — 0 at 12 o'clock, one revolution per 100 meters or feet (unit selectable in the settings), hundreds in the circle, needle lightly smoothed against sensor noise.
  * Swipe up on the altimeter: SYNC? popup — confirming re-bases the altitude reference on the current reading, cancelling the weather drift (see *Calibrating* below).
  * The sensor only runs while this screen is shown; while the watch is locked it drops to one reading per minute.

Line Dash resumes on the screen — including the sub-view — you were on when the app was reloaded: get a message while checking your heart rate mid-run, and you return straight to the HRM gauge with the sensor re-enabled.

## Settings

* **Show Lock:** Display a padlock icon when the screen is locked.
* **Show Minute:** Toggle the digital minute display in the center of the clock gauge.
* **Distance Unit:** `km` or `mi`.
* **Stride (m):** Your stride length (0.40 m to 1.20 m), for the distance calculation.
* **Show Steps / Battery / Heart Rate / Barometer:** Enable or disable the individual gauges.
* **Altitude Unit:** Altimeter in meters (`m`) or feet (`ft`).
* **Sea level (hPa):** Calibrate the barometer against your local weather report (see below).
* **Live HR Updates:** Whether the Heart Rate gauge updates live while viewing it (on by default).
* **Live HR Interval:** How often the live gauge redraws (2 s to 120 s).
* **HR Age Decade:** Your age decade (20s-80s), from which Max HR and the HR zones are derived.

### Calibrating the Barometer

1. Look up the current air pressure for your town in any weather report (e.g. 1014 hPa) — weather reports always give the sea-level value, which is exactly what you need.
2. On the watch, open *Settings → Apps → Line Dash → Sea level (hPa)*. The entry takes a reading ("wait..."), then shows the current calibrated value.
3. Set it to the value from your weather report. Done.

The correction is a constant for your location — it covers both your altitude above sea level and the sensor's individual offset — so the displayed pressure keeps matching the weather report even as the weather changes.

The **altitude**, however, reads against the sea-level pressure captured at calibration time, so weather changes make it drift by roughly 8 m per hPa even while the pressure display stays correct. When you are back on the height you calibrated at, the SYNC? popup on the altimeter view (swipe up, swipe up) fixes that in one gesture: the current reading becomes the new reference and the altitude returns to its calibrated value. On any other height, recalibrate via the settings menu with a current weather report instead.

## Credits

Line Dash was created by [pagnotta](https://github.com/pagnotta), built upon the foundation of the [Line Clock](https://github.com/espruino/BangleApps/tree/master/apps/line_clock) app originally created by deepDiverPaul. It has been expanded into a suite of interactive, swipeable dashboard gauges.

## License

This app is released under the [MIT License](LICENSE).
