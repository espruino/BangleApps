# OpenLocate Beacon

Collect geolocation sensor data from the Bangle.js 2's GPS and barometer, display the live readings on-screen, and broadcast in Bluetooth Low Energy (BLE) OpenLocate Beacon packets (LCI over BLE) to any listening devices in range.

## Usage

The advertising packets will be recognised by [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware and any other program which observes the standard packet types.  See our [Bangle.js Development Guide](https://reelyactive.github.io/diy/banglejs-dev/) for details.

## Features

Advertises packets with the OpenLocate Beacon geolocation element when a GPS fix is available, and packets with the name "Bangle.js" otherwise.

## Requests

[Contact reelyActive](https://www.reelyactive.com/contact/) for support/updates.

## Creator

Developed by [jeffyactive](https://github.com/jeffyactive) of [reelyActive](https://www.reelyactive.com)
