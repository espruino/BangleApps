# F3 Blue Moon Widget

<b>F3 Blue Moon Widget</b> is a widget that displays a moon-phase indicator on the
[Espruino Bangle.js](https://banglejs.com/) wristwatches (both v1 and v2).

<b>F3 Blue Moon Widget</b> is brought to you by the
[FatFingerFederation](https://codeberg.org/FatFingerFederation/).

## Usage

This is a widget; simply install it and it will proceed to widge.

## Configuration

There are two options, configurable via the `Settings` app;
look for `F3 Blue Moon Widget`.

 * _Hemisphere_
   * The hemisphere setting will cause the moon display to flip appropriately
     to match (more or less) what you will see in the sky.
   * By default, if you also have the `My Location` app installed and working,
     the widget will use your latitude to determine your hemisphere.  Otherwise,
     the widget defaults to _Northern_.
   * You can explicitly set the hemisphere to _Northern_ or _Southern_ instead.
 * _Color_
   * The full gamut of 3-bit colors is available for your choosing:
     red (R), green (G), blue (B), yellow (RG), cyan (GB), magenta (BR),
     and white (RGB)!
   * The default color setting is "GB", e.g. a light blue or cyan.

## Reporting Issues

Upstream development happens at
[FatFingerFederation/F3BlueMoonWidget](https://codeberg.org/FatFingerFederation/F3BlueMoonWidget);
please report any bugs/issues/etc there directly.

## Development and Algorithms

The math used to determine the moon phase was adapted from
https://github.com/pjain03/moon_phases, which itself is an implementation
of algorithms from "Astronomical Algorithms (2nd Ed)", Jean Meeus (1999).
For the widget, the algorithms were simplified considerably, removing many
terms and correction factors that had no appreciable effect on displaying
a moon image that is only 22 pixels wide.

That said, the output is still quite accurate, and was cross-checked against
100 years of daily ephemeris results produced by the
[NASA Jet Propulsion Laboratory](https://www.jpl.nasa.gov/)'s
Solar System Dynamics [Horizons System](https://ssd.jpl.nasa.gov/horizons/).

The F3 Blue Moon output was also compared to two other moon-phase algorithms
that coexist in the BangleApps catalog:
 * `moonPhase()` in the [`widmp` widget](https://github.com/espruino/BangleApps/tree/master/apps/widmp) (and others), derived from https://github.com/deirdreobyrne/LunarPhase
 * `getMoonIllumination()` in the [`suncalc` module](https://github.com/espruino/BangleApps/tree/master/modules/suncalc), derived from https://github.com/mourner/suncalc

The "moon's phase" basically means "what fraction of the moon is
illuminated by the sun", and that is really determined by the Sun-Moon-Earth
angle, squeezed through a cosine transformation.  (Actually, we use the
Sun-Earth-Moon angle; since the Earth and Moon are so close to each other
relative to the Sun, this amounts to a neglibible difference, less than
0.2 degrees.)

To compare the F3 Blue Moon math to that of the other two, we looked
at the error (relative to the JPL Horizons data) of both the calculated
illumination fraction and the Sun-Earth-Moon angle.

Here is the `[min, max]` error measured over 100 years of daily samples
(from 2026-01-01 to 2125-12-31):

| algorithm    | illuminated fraction (%) | sun-earth-moon (deg) |
|--------------|--------------------------|----------------------|
| F3 Blue Moon | `[-0.57, 0.41]`          | `[-0.70, 0.74]`      |
| LunarPhase   | `[-0.29, 0.29]`          | `[-4.96, 4.97]`      |
| suncalc      | `[-3.54, 3.67]`          | `[-4.31, 4.68]`      |

The LunarPhase algorithm produced the best illumination fraction output,
with a deviation of less than ±0.3%, but our Blue Moon algorithm was a
close second, with a deviation of less than ±0.6%.  The suncalc results
were kind of lousy, with error bars of greater than ±3.5%.  (Given
that "full moon" is considered to mean ">99% illumination", then an
error of ±3.5% is quite significant.)

Looking at the errors in Sun-Earth-Moon angle, our Blue Moon algorithm
was by far the best (under ±0.75 degrees), and the LunarPhase algorithm
was the worst (up to about ±5 degrees) with suncalc barely any better.

How can it be that LunarPhase has the tightest bounds on illumination,
but worst bounds on angle, when the illumination is derived from angle?
The answer lies in *where* the errors occur.  The LunarPhase algorithm
happens to give the worst results for angle at those angles where it
has the least effect on illumination, i.e., around the angles 0 and π,
corresponding to new and full moons.  (That makes some sense given that
the LunarPhase algorithm seems to have been constructed, not so much
from astronomical first principles, but by curve-fitting
until the illuminated fraction values were optimized.)

Overall, the Blue Moon code, sourced from principled astronomical
algorithms, provides compellingly accurate values for both illuminated
fraction and angle.

## Creator
- [Matt Marjanovic](https://codeberg.org/maddog)
