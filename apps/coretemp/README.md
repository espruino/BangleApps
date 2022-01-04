# CoreTemp display

Basic example of connecting to a bluetooth [CoreTemp](https://corebodytemp.com/) device and displaying the current skin and body core temperature readings.

## Usage

Background task connects to any CoreTemp device (2100/2101) and emits a CoreTemp signal value for each reading.
Application contains three components, one is a background task that monitors the sensor and emits a 'CoreTemp' signal on activity if activated in settings.
The widget shows when the sensor is enabled with a mini value and blinks on use.
The app listens for 'CoreTemp' signals and shows the current skin and core temperatures in large numbers.

## TODO

* Integrate with other tracking/sports apps to log data.
* Add specific device selection

## Creator

Ivor Hewitt
