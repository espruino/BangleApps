## Pacer

![icon](app.png)

Run with a virtual partner at your chosen pace, and export the GPX data
from the Bangle.js App Store.

## Usage

Pacer starts up with a menu.

* **Recording** - whether to record the run
* **Units** - imperial or metric
* **Lap** - the multiple of a mile or kilometer to use for splits
* **Dark mode** - use black or white background
* **Eco battery** - display will turn off after 10 seconds
* **Eco storage** - only record GPS position every 10 seconds
* **Steps** - display step count or cadence
* **Pacer** - pace of virtual partner

On selecting **Start**, GPS position will be detected.  A run cannot be
started without a GPS fix.  The watch touchscreen is disabled while the
app is running.

The app will run on Bangle.js 1 and 2, although use on Bangle.js 2 is not
recommended due to poor GPS accuracy.

On a Bangle.js 1, the top button reverses the screen colours, the middle
button starts, pauses or resumes a run, and the bottom button ends the run.

On a Bangle.js 2, a short press of the button starts, pauses or resumes a
run, and a long press (over 0.5 seconds, but under 2!) ends the run.  Note
that holding the button for 2 seconds will exit back to the default clock
app.

## Downloading

GPX tracks can be downloaded using the
[App Loader](https://banglejs.com/apps/?id=pacer).  Connect the
Bangle.js and click on the Pacer app's disk icon to see the tracks
available for downloading.

## Tips

For best results, only start a run when the satellite signal strength bar is
green.

Use the [Assisted GPS Updater](https://banglejs.com/apps/#AGPS) to improve
the time taken to get a GPS fix.

## Bugs

The eco settings are unlikely to be useful.

GPS track smoothing is accomplished simply by reducing the frequency with
which readings are taken, depending on signal strength.
