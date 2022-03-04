# Adjust Clock

Adjusts clock continually in the background to counter clock drift.

## Usage

First you need to determine the clock drift of your watch in PPM (parts per million).

For example if you measure that your watch clock is too fast by 5 seconds in 24 hours,
then PPM is `5 / (24*60*60) * 1000000 = 57.9`.

Then set PPM in settings and this widget will continually adjust the clock by that amount.

## Settings

See **Basic logic** below for more details.

- **PPM x 10** - change PPM in steps of 10
- **PPM x 1** - change PPM in steps of 1
- **PPM x 0.1** - change PPM in steps of 0.1
- **Update Interval** - How often to update widget and clock error.
- **Threshold** - Threshold for adjusting clock.
  When clock error exceeds this threshold, clock is adjusted with `setTime`.
- **Save State** - If `On` clock error state is saved to file when widget exits, if needed.
  That is recommended and default setting.
  If `Off` clock error state is forgotten and reset to 0 whenever widget is restarted,
  for example when going to Launcher. This can cause significant inaccuracy especially
  with large **Update Interval** or **Threshold**.
- **Debug Log** - If `On` some debug information is logged to file `widadjust.log`.

## Display

Widget shows clock error in milliseconds and PPM.

## Basic logic

- When widget starts, clock error state is loaded from file `widadjust.state`.
- While widget is running, widget display and clock error is updated
  periodically (**Update Interval**) according to **PPM**.
- When clock error exceeds **Threshold** clock is adjusted with `setTime`.
- When widget exists, clock error state is saved to file `widadjust.state` if needed.

## Services

Other apps/widgets can use `WIDGETS.adjust.now()` to request current adjusted time.
To support also case where this widget isn't present, the following code can be used:

```
function adjustedNow() {
  return WIDGETS.adjust ? WIDGETS.adjust.now() : Date.now();
}
```

## Acknowledgment

Uses [Clock Settings](https://icons8.com/icon/tQvI71EfIWy3/clock-settings)
icon by [Icons8](https://icons8.com).
