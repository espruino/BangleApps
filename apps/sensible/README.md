# Sensible

Collect all the sensor data from the Bangle.js 2, display the live readings in menu pages, and broadcast in Bluetooth Low Energy (BLE) advertising packets to any listening devices in range.


## Usage

The advertising packets will be recognised by [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware and any other program which observes the standard packet types.  Also convenient for testing individual sensors of the Bangle.js 2 via the menu interface.


## Features

Currently implements:
- Accelerometer
- Barometer
- GPS
- Heart Rate Monitor
- Magnetometer

in the menu display, and broadcasts all sensor data readings _except_ acceleration in Bluetooth Low Energy advertising packets as GATT characteristic services.


## Controls

Browse and control sensors using the standard Espruino menu interface.


## Requests

[Contact reelyActive](https://www.reelyactive.com/contact/) for support/updates.


## Creator

Developed by [jeffyactive](https://github.com/jeffyactive) of [reelyActive](https://www.reelyactive.com)
