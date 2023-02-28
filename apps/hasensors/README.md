# Home Assistant Sensors

Sends sensor values to [Home Assistant](https://www.home-assistant.io/) using 
the [Android Integration](/?id=android).   
It doesn't use the Home Assistant app on your phone, but posts directly to 
Home Assistant, so it only works if Home Assistant can be reached from your phone.

## Setup

You need to fill out these fields:

* *Sensor ID*: This is prefixed to sensor IDs in Home Assistant.   
  If you set this to `banglejs`, the battery sensor will be named `sensor.banglejs_battery_level`.
* *Sensor Name*: This is prefixed to human-friendly sensor names.
  If you set this to `Bangle.js`, the battery sensor will show as `Bangle.js Battery Level`.
* *Home Assistant URL*: The URL of your Home Assistant Installation.
* *Authentication Token*: You need to generate a Long-Lived Access Token in
  Home Assistant, at the bottom of [your profile page](https://my.home-assistant.io/redirect/profile/).

## Features

Currently creates these sensors:
* `<sensor id>_battery_level`: Your watch battery level as percentage
* `<sensor id>_battery_state`: `charging` or `discharging`