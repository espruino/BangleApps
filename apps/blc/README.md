# Binary LED Clock

A binary watch with LEDs, showing time and date.

From top to bottom the watch face shows four rows of leds:

* hours (red leds)
* minutes (green leds)
* day (yellow leds, top row)
* month (yellow leds, bottom row)

The colors are default colors and can be changed at the settings page, also, the outer ring can be disabled.

The rightmost LED represents 1, the second 2, the third 4, the next 8 and so on, i.e. values are the powers of two.

As usual, luminous leds represent a logical one, and "dark" leds a logcal '0'. Dark means the color of the background.
Widgets aren't affected and are shown as normal.
