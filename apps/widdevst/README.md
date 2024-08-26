# Device Status Widget

This widget shows a rectangle containing

- `B` if Bluetooth is on
- `C` if the compass is on
- `G` if GPS is on
- `H` if the heart rate monitor is on

at fixed positions, and two bars

- left to right: usage of Flash storage
- bottom to top: usage of RAM

in green if below 50%, orange if between 50% and 80%, and red if above 80%.

The widget will redraw more frequently when unlocked.

It can be configured to avoid redrawing if all monitored peripherals are off, waiting until it hears from them (meaning you won't see regular RAM/Storage updates, but save battery by avoiding drawing). This can be configured by writing `{"redrawBars":0}` to `widdevst.settings.json`.
