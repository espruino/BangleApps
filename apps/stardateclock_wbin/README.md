# Stardate Clock with Binary Time

A clock face displaying a stardate (in the format YYYYMMDD.hhmm.ss) along with a "standard" digital/analog clock and a binary time display in LCARS design.

This version is a variant of the original Stardate Clock by Robert Kaiser <kairo@kairo.at>, with binary time features added. The binary time is shown as two rows of buttons at the bottom of the display: the top row represents the hours (in 8, 4, 2, 1 binary), and the bottom row represents the minutes (in 8, 4, 2, 1 binary). Each button is colored to indicate whether its bit is set, and the value is shown on the button.

The LCARS design has been made popular by various Star Trek shows. Credits for the original LCARS designs go to Michael Okuda, copyrights are owned by Paramount Global, usage of that type of design is permitted freely for non-profit use cases.

The stardate concept used leans on the shows released from the late 80s onward by using 1000 units per Earth year, but this version displays the stardate in the format YYYYMMDD.hhmm.ss for clarity and familiarity.

The clock face supports Bangle.js 1 and 2 with some compromises (e.g. the colors will look best on Bangle.js 1, the font sizes will look best on Bangle.js 2).

Any tap on the display while unlocked switches the "standard" Earth-style clock between digital and analog display.
