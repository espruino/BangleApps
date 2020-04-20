# Summary

Battery Chart contains a widget that records the battery usage as well as information that might influence this usage.

The app that comes with provides a graph that accumulates this information in a single screen.

## How the widget works

The widget records data in a fixed interval of ten minutes.

When this timespan has passed, it saves the following information to a file called `bclogx` where `x` is

the current day retrieved by `new Date().getDay()`:

- Battery percentage
- Temperature (of the die)
- LCD state
- Compass state
- HRM state
- GPS state

After seven days the logging rolls over and the previous data is overwritten.

To properly handle the roll-over, the day of the previous logging operation is stored in `bcprvday`.

The value is changed with the first recording operation of the new day.

## How the App works

### Events

The app charts the last 144 (6/h * 24h) datapoints that have been recorded.

If for the current day the 144 events have not been reached the list is padded with

events from the previous `bclog` file(s).

### Graph

The graph then contains the battery percentage (left y-axis) and the temperature (right y-axis).

In case the recorded temperature is outside the limits of the graph, the value is set to a minimum of 19 or a maximum of 41 and thus should be clearly visible outside of the graph's boundaries for the y-axis.

The states of the various SoC devices are depicted below the graph. If at the time of recording the device was enabled a marker in the respective color is set, if not the pixels for this point in time stay black.

If a device was not enabled during the 144 selected events, the name is not displayed.

## File schema

You can download the `bclog` files for your own analysis. They are `CSV` files without header rows and contain

```
timestamp,batteryPercentage,temperatureInDegreeC,deviceStates
```

with the `deviceStates` resembling a flag set consisting of 

```
const switchableConsumers = {
 none: 0,
 lcd: 1,
 compass: 2,
 bluetooth: 4,
 gps: 8,
 hrm: 16
};
```
