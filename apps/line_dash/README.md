# Line Dash

A beautiful analog clock with swipeable stats dashboards for Bangle.js 2.

Line Dash provides a suite of minimalist gauges that you can swipe through to check your daily stats. It features a clean design where each metric gets its own dedicated screen, keeping your main clock face completely uncluttered. The app is intentionally full-screen and does not display widgets.

## Screenshots

| Clock | Heart Rate | Steps | Battery |
| :---: | :---: | :---: | :---: |
| ![](app-screenshot-clock.png) | ![](app-screenshot.png) | ![](app-screenshot-step.png) | ![](app-screenshot-bat.png) |

## Features

* **Clock:** A clean, easy-to-read analog clock face that automatically inherits your system's 12/24 hour preference. Tap to briefly show the date (weekday and day/month, following your system language). While a timer is running, a small magenta marker sits on the dial at the position the hand will have reached when the timer fires — like the bezel of a diver's watch (the marker is hollow while the timer is paused).
* **Timer:** A kitchen timer, one swipe up from the clock face, on a 0-60 minute dial (one revolution per hour). Tap the timer to open a menu to set the duration and start it (the circle shows START while the timer is waiting to go). While running, the view wears the clock's own white/red colors; while paused or stopped, needle and circle turn magenta, with a pause icon while paused. The circle counts down the remaining minutes, switching to seconds for the final minute — the countdown stays live even while the watch is locked. Swipe up to pause, swipe down to resume; swiping up on a paused timer asks to reset it (RESET? popup, confirm with one more swipe up). The ringing is handled by the system scheduler: the timer fires with the standard alarm screen (buzz, snooze, dismiss) even if a message or another app has taken over the screen in the meantime — it even survives a reboot. A tap on a running or paused timer shows the exact remaining time, counting down live.
* **Steps:** Tracks your daily steps using a sweeping dial. Tap to briefly show the exact step count. The screen carries two sub-views, entered by swiping up: first the distance covered today (derived from your steps and stride length), then the trip meter — swipe up on the distance to start a trip ("count from here"), swipe down to climb back to the distance and the steps; the trip keeps running in the background. A tap briefly shows the exact value of the current view. Swiping up in the trip view asks to reset the trip (a RESET? popup); confirm with one more swipe up, or dismiss it by swiping down or waiting. The trip view is marked with a TRIP indicator, survives app reloads, and automatically ends at midnight.
* **Heart Rate:** Features a color-coded HR Zone gauge. The HR sensor only activates when you swipe to this screen to conserve battery, and the gauge updates live while you are viewing it (can be disabled in the app settings to save power).
* **Barometer:** Shows the current air pressure on a 300-degree 950-1050 hPa dial using the built-in pressure sensor. The wide sweep makes small pressure changes easy to spot. The dial gives the hundreds, while the center circle shows the last two digits of the reading (e.g. "13" for 1013 hPa). Tap to briefly show the exact reading. Swipe up for the altimeter sub-view (recognizable by its unit-suffixed labels), laid out like an aircraft altimeter: 0 sits at the 12 o'clock position and one full revolution of the dial covers 100 meters or feet (selectable in the settings), with ticks every 10 units. The circle shows the hundreds, the needle is lightly smoothed against sensor noise, and a tap shows the exact altitude; swipe down returns to the pressure dial. Since weather changes make the altitude drift (~8 m per hPa), another swipe up offers to re-base the reference on the current reading (SYNC? popup) — a one-gesture fix for the drift whenever you are back on the height you calibrated at. The reading can be calibrated to sea level in the settings, so it matches your local weather report (this also serves as the altimeter reference). The sensor only runs while this screen is shown, and while the watch is locked it drops to a single reading per minute to save power.
* **Resume:** Line Dash remembers which screen you were on across app reloads — get a message while checking your heart rate mid-run, and you will return straight to the HRM gauge (with the sensor re-enabled).
* **Battery:** Displays your current battery level in a classic 180-degree "fuel gauge" layout with fixed color zones on the dial: green above 30%, a yellow warning band down to 15%, and a red reserve below — needle and center circle take the color of the current zone. When you plug in your watch, the app automatically switches to this dashboard and displays a dynamic green charging indicator. Unplugging it automatically returns you to the main clock!

## Controls

* **Swipe Left / Right:** Cycle through the different dashboard gauges.
* **Tap (Clock):** Shows the date for a few seconds; tap again to dismiss it early.
* **Swipe Up (Clock):** Climbs to the timer sub-view. On the timer it pauses a running timer, and asks to reset a paused one (RESET? popup; one more swipe up within 3 seconds confirms).
* **Swipe Down (Clock):** Dismisses the RESET? popup, resumes a paused timer, or climbs from the timer back to the clock face (a running timer keeps running).
* **Tap (Timer):** With no timer running, opens the menu that sets the duration and starts the timer. On a running or paused timer it shows the exact remaining time for a few seconds; tap again to dismiss it early.
* **Tap (Steps):** Shows the exact step count — or distance of the current sub-view — for a few seconds; tap again to dismiss it early.
* **Tap (Barometer):** Shows the exact pressure reading — or, in the altimeter view, the exact altitude — for a few seconds; tap again to dismiss it early.
* **Swipe Up / Down (Barometer):** Switches between the pressure dial and the altimeter sub-view. Another swipe up on the altimeter offers to re-base the altitude reference on the current reading (SYNC? popup; one more swipe up within 3 seconds confirms) — do this on the height you originally calibrated at, and the weather drift is gone without a trip to the settings.
* **Swipe Up (Steps):** Climbs one sub-view deeper: steps → distance → trip (starting a trip if none is running). In the trip view it shows a RESET? popup; one more swipe up within 3 seconds resets the trip.
* **Swipe Down (Steps):** Dismisses the RESET? popup, or climbs one sub-view back up without resetting the trip: trip → distance → steps.

## Customization

The app includes a comprehensive settings menu where you can configure the following options:

* **Show Lock:** Display a padlock icon when the screen is locked.
* **Show Minute:** Toggle the digital minute display in the center of the clock gauge.
* **Distance Unit:** Manually override the distance unit to `km` or `mi`.
* **Stride (m):** Set your personal stride length (0.40m to 1.20m) for accurate distance calculation.
* **Show Steps:** Enable or disable the Steps gauge screen.
* **Show Battery:** Enable or disable the Battery gauge screen.
* **Show Heart Rate:** Enable or disable the Heart Rate gauge screen.
* **Show Barometer:** Enable or disable the Barometer gauge screen.
* **Altitude Unit:** Show the altimeter in meters (`m`) or feet (`ft`).
* **Sea level (hPa):** Calibrate the barometer against your local weather report. The menu takes a reading when opened; set the value your weather report gives for the current sea-level pressure, and the app derives a constant correction covering both your altitude and the sensor offset. The entered value also becomes the reference for the altitude overlay (recalibrate before relying on it, as weather changes shift the estimate by roughly 8m per hPa).
* **Live HR Updates:** Toggle whether the Heart Rate gauge updates live while viewing it (enabled by default).
* **Live HR Interval:** If Live HR is enabled, select how often the gauge redraws (2s, 5s, 15s, 30s, 60s, 90s, or 120s).
* **HR Age Decade:** Select your age decade (20s, 30s, 40s, 50s, 60s, 70s, or 80s) to accurately calculate your Max HR and corresponding HR Zones.

### Calibrating the Barometer

1. Look up the current air pressure for your town in any weather app or report (e.g. 1014 hPa). Weather reports always give the sea-level value, which is exactly what you need.
2. On the watch, open *Settings → Apps → Line Dash → Sea level (hPa)*. The entry shows "wait..." for a second while a reading is taken, then the current calibrated value.
3. Set it to the value from your weather report. Done.

The correction is a constant for your location — it covers both your altitude above sea level and the sensor's individual offset — so the displayed pressure keeps matching the weather report even as the weather changes. Recalibrate only after moving to a different altitude, or right before a hike if you want the altitude overlay to start as accurately as possible (weather changes shift the altitude estimate by roughly 8 m per hPa).

The altimeter reads against the sea-level pressure captured at calibration time, so weather changes make the displayed altitude drift by those same 8 m per hPa even while the pressure display stays correct. When you are back on the height you calibrated at, you do not need the settings menu to fix that: swipe up on the altimeter view and confirm the SYNC? popup — the current reading becomes the new reference and the altitude returns to its calibrated value. (On any other height, syncing would carry that calibration height over, so use the settings menu with a current weather report instead.)

## Credits

Line Dash was created by [pagnotta](https://github.com/pagnotta), built upon the foundation of the [Line Clock](https://github.com/espruino/BangleApps/tree/master/apps/line_clock) app originally created by deepDiverPaul. It has been expanded into a suite of interactive, swipeable dashboard gauges.

## License

This app is released under the [MIT License](LICENSE).
