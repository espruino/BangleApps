# Compass

This app uses Bangle.js's built-in magnetometer as a compass.

## Usage

Hold your Bangle.js **face up** (so the display is parallel to the ground),
and the red arrow will point north, with the heading in degrees printed at
the top of the screen.

This compass app does not include tilt compensation - so much like a real
compass you should always keep it face up when taking a reading.

The first time you run the compass after your Bangle has booted (or if
you move to an area with a substantially different magnetic field) you will
need to recalibrate your compass (even if a heading is shown).

## Calibration

Press the button next to the `RESET` label on the screen. The North/South marker
will disappear and a message will appear asking you to rotate the watch 360 degrees.

* Hold the watch face up, so the display is parallel to the ground
* Rotate it around slowly, all 360 degrees (with the display still parallel to the ground)
* The `Uncalibrated` message will disappear before you have finished rotating the full 360 degrees - but you should still complete the full rotation in order for the compass to work properly.

Once you've rotated the full 360 degrees your compass should now work fine,
and calibration is stored between runs of the app. However if you go near
to a strong magnet you may still need to recalibrate.
