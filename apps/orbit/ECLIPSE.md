# Eclipse calculation and display maintenance

This document is for maintainers; it is not a watch settings screen.

## Files and interfaces

- `eclipse.js`: independent dependency-free JavaScript engine. `calculate(Date, {deltaT, moonK})`
  returns `{axisHitsEarth, lat, lon, gamma, type}`. `prepare` additionally returns geometry
  used for shading. Degrees east-positive; `gamma` is unsigned instantaneous closest-axis
  distance in equatorial Earth radii, NOT NASA's signed greatest-eclipse gamma.
- `eclipse-terms.js`: 60 longitude/distance terms and 60 latitude terms. `MOON_TERMS` in
  the engine caps EACH table; full tables remain the default. `moonTerms` may override it
  for experiments. Tables are kept in published order; distance truncation is not uniform.
- `eclipse-sun-terms.js`: short VSOP87D Earth (83 L, 5 B, 45 R terms), retained amplitude
  >=30 in original 1e-8 units. Default Sun uses this series. `{sunMethod:"low"}` selects
  Meeus ch.25 low-precision Sun for comparison; it had up to ~2 px error near contacts.
- `eclipse-render.js`: 30-second cache/update and inverse polar map raster. Change
  `UPDATE_MS` here to change the watch scheduler too. Option changes invalidate cache.
- `app.js`: calls renderer after `drawEarth` and before `drawObserver`. Repaints Earth
  on each active shadow update and the first update after disappearance, avoiding trails.
- `settings.js`: `Solar eclipse / Enabled` persists `eclipseEnabled` in orbit.json.
- `test.js`: Node-only validation, not installed on Bangle. Run `node apps/orbit/test.js`.

## Calculation and assumptions

Time: Julian date UTC, approximated as UT1 for Earth rotation; TT=UT1+Delta T. The NASA
Espenak-Meeus polynomial is the default; `deltaT` (seconds) overrides it. A JavaScript
Date is already an absolute timestamp: do not add display timezone/DST again.

Moon: Meeus Astronomical Algorithms 2nd edition ch.47, Tables47.A/B; all periodic terms
plus additive corrections. Sun: ch.32 VSOP87D Earth, converted to apparent Sun according
to ch.25, including FK5 and aberration. Coordinate conversion ch.13; short nutation and
obliquity ch.22; GAST=GMST+equation of equinoxes (ch.12). Every vector is km in the true
frame of date, rotated into Earth-fixed coordinates with GAST.

Geometrical shadow: a forward ray from Moon away from Sun, first WGS84 ellipsoid
intersection. Uses closest-axis point to reduce quadratic cancellation. No intersection
means no CENTER crossing, not no partial eclipse. Total/annular compares apparent
radii at the surface intersection, not at Earth's center. Default lunar radius ratio
0.272281 (NASA umbral convention). Penumbra uses the same spherical lunar radius;
NASA uses a slightly different penumbral limb radius. This difference is small here.

Brightness: cone geometry and analytic overlap of two uniform disks, approximating
angular disks in a common small-angle plane. Fraction covered is rendered as 16-level
ordered black dithering; total umbra is exactly black. Solar limb darkening, terrain,
atmospheric scattered light and lunar relief are not modeled. A subpixel total center
gets one black pixel for visibility. The opposite displayed hemisphere is not drawn.

## Power/memory policy

No sensors/network. Off avoids all eclipse module/data loads and restores 60-second
clock tick. Enabled uses a single 30-second clock scheduler. Away from new Moon a mean
elongation gate avoids periodic series. Within +/-30 degrees, a conservative 12-term
Moon + low-Sun angular gate runs at most every ten minutes. Only within 3 degrees does
the full model run every 30 seconds. Both screens have generous margins in 1900-2100;
this is the intended accuracy-validation range. Custom render options bypass the fine
gate. Direct `calculate` never gates its requested result.

Coefficient tables load lazily, are flattened typed arrays, and stay only in RAM during
that clock session. Off/reload frees them. No full-screen framebuffer, pixel readback,
or trigonometry per surface pixel. Mask inverse projection is calculated on demand.
LCD-off, calendar/settings/launcher and kill stop the scheduler; LCD-on recalculates.
On Bangle2 the MIP LCD normally remains powered when only the backlight is off, so
backlight-off does not itself stop the clock's 30-second scheduler.

## Validation results (R=48 pixel comparison, before raster rounding)

NASA greatest-eclipse inputs use the same Delta T as their published Bessel tables:

| UTC | NASA lat/lon deg | Computed lat/lon deg | Error deg lat/lon | Projected error px |
|---|---|---|---|---|
|2017-08-21 18:25:31.8|36.966667 / -87.671667|36.971630 / -87.646457|+0.004964 / +0.025210|0.017058|
|2024-04-08 18:17:18.3|25.286667 / -104.138333|25.279763 / -104.180237|-0.006904 / -0.041903|0.031838|

2017's remembered 37.6N/89.1W is the greatest-duration location at 18:21:49, not
its greatest-eclipse point. Tests compare every minute from 15:00 through 21:00 UTC
to independently transformed NASA Bessel polynomial elements, including Delta T
rotation correction for mu. Shared-axis-hit samples: 193 (2017),194 (2024). Maximum
projected errors 0.426404 and 0.257716 px. At the contact edge, 2024 has one one-minute
sample where axis-intersection classification differs. That is explicitly reported,
not counted as zero position error. These two events do not prove global 0.5 px accuracy.
Also, held position for 30 seconds adds motion error, especially near contact; the
reported model errors exclude that hold interval and integer raster rounding.

Additional tests: Meeus lunar worked example 1992-04-12 TT, overlap identities, full
Moon rejection, night-side rejection, 2023-10-14 annular, 2025-03-29 partial-only,
cache invalidation, disappearance, red dot/line layering, one timer, off/LCD cancellation.
Host tests and software raster inspection passed. Actual Bangle hardware timing,
free RAM, battery consumption and on-watch raster appearance have not been measured.

## Next accuracy changes, in order

1. Broader date/contact comparison, especially grazing events and 30-second hold motion.
2. Improve lunar ephemeris terms and consistent light-time/aberration corrections if
   contact position error is dominant; contact geometry amplifies small angular errors.
3. Replace predicted Delta T with observed/recent values when available, via override.
4. Extend VSOP truncation only if solar error dominates; avoid cost without evidence.
5. Refine lunar limb / separate umbral-penumbral k values and limb-darkened brightness.

## Sources

- Meeus, Astronomical Algorithms, 2nd ed., chapters7,12,13,22,25,32,47.
- Bretagnon & Francou (1988), VSOP87, Astronomy and Astrophysics 202,309-315.
- Numeric table cross-checks (not copied program logic):
  https://github.com/architest/pymeeus/blob/395803c8081758590f92c94a432dd7cac9fbde5a/pymeeus/Moon.py
  https://github.com/architest/pymeeus/blob/8a0f784eb6ca7e7341bc3ed291ee50623f0e4869/pymeeus/Earth.py
- https://eclipse.gsfc.nasa.gov/SEhelp/deltatpoly2004.html
- https://eclipse.gsfc.nasa.gov/SEbeselm/SEbeselm2001/SE2017Aug21Tbeselm.html
- https://eclipse.gsfc.nasa.gov/SEbeselm/SEbeselm2001/SE2024Apr08Tbeselm.html

All coefficients used were cross-checked. No guessed coefficients or unresolved
coefficient TODOs. The remaining limitations above are deliberate approximations.
