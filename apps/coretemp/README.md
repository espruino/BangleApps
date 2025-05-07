# CoreTemp display

Application to connect to the [CORE](https://corebodytemp.com/) or [calera](https://info.greenteg.com/calera-research) devices from greenteg and display the current skin and body core temperature readings. 

This also includes a module (heavily influenced by the BTHRM app) so you can integrate the core sensor into your own apps/widgets. You can also pair an ANT+ heart rate strap to the CORE/calera sensor as well in the App Settings so that you can leverage the exertional algorthim for estimating core temperature.

## Usage

Background task connects to a paired and emits a CORESensor signal value for each reading.
Application contains three components, one is a background task that monitors the sensor and emits a 'CORESensor' signal on activity if activated in settings.
The widget shows when the sensor is enabled and connected (green) or disconnected (grey).
The app listens for 'CORESensor' signals and shows the current data.

## CORESensor Module

With the module, you can add the CORE Sensor to your own app. Simply power on the module and listen to CORESensor:

```
Bangle.setCORESensorPower(1,appName);
Bangle.on('CORESensor', (x) =>{ ... });
```

The CORESensor emits an object with following keys:

* **core**: Estimated/Predicted core temperature
* **skin**: Measured skin temperature
* **unit**: "F" or "C"
* **hr**: Heart Rate (only when ANT+ heart rate monitor is paired)
* **heatflux**: (calera device only - needs encryption level b released by greenteg)
* **hsi**: Heat Strain Index ([read more here](https://help.corebodytemp.com/en/articles/10447107-heat-strain-index), exertional algorithm only)
* **battery**: battery level
* **quality**: Used to indicate the quality or trust level of the current measurement values

## TODO

* Integrate with other tracking/sports apps to log data.
* Emit Bangle.js heart rate to device as a heart rate for internal algorthim

## Creators/Contributors

Ivor Hewitt

[Nicholas Ravanelli](https://github.com/nravanelli)
