# Sensible

Collect all the sensor data from the Bangle.js 2, display the live readings in menu pages, and broadcast in Bluetooth Low Energy (BLE) advertising packets to any listening devices in range.


## Usage

The advertising packets will be recognised by [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware and any other program which observes the standard packet types.  See our [Bangle.js Development Guide](https://reelyactive.github.io/diy/banglejs-dev/) for details.  Also convenient for testing individual sensors of the Bangle.js 2 via the menu interface.

![SensiBLE in Pareto Anywhere](/BangleApps/apps/sensible/screenshot-pareto-anywhere.png)


## Features

Currently implements:
- Accelerometer
- Barometer
- GPS
- Heart Rate Monitor
- Magnetometer

in the menu display, and broadcasts all sensor data readings _except_ acceleration in Bluetooth Low Energy advertising packets as GATT characteristic services.


## Controls

Browse and control sensors using the standard Espruino menu interface.  By default, all sensors _except_ the accelerometer are disabled.  Sensors can be individually enabled/disabled via the menu.  These settings are written to persistent storage (flash) and will be applied each time the SensiBLE app is loaded.


## Requests

[Contact reelyActive](https://www.reelyactive.com/contact/) for support/updates.


## Creator

Developed by [jeffyactive](https://github.com/jeffyactive) of [reelyActive](https://www.reelyactive.com)
