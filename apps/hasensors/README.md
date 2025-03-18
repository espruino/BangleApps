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
* `<sensor id>_hrm`: Heart rate (only if measured: this app doesn't enable/disable the sensor)
* `<sensor id>_steps`: Step Count
* `<sensor id>_pressure`: Pressure
* `<sensor id>_temperature`: Temperature

## Home Assistant `unique ID` workaround

If you try to customize the created entities, Home Assistant will complain that
> This entity ('sensor.…') does not have a unique ID, therefore its settings 
> cannot be managed from the UI.

The problem is that these sensors are created "dynamically", and there is no way
to supply a `unique ID`.
There is a workaround though: 
1. Make note of the sensor name you want to customize (e.g. `banglejs_battery_state`).
2. Disconnect your Bangle.js from your phone, so it doesn't send updates.
3. Restart Home Assistant, the sensor is now gone.
4. <a href="https://my.home-assistant.io/redirect/config_flow_start?domain=template" target="_blank">Create a template sensor</a>: choose "Template a sensor".
  - Use the name from step 1 (without `sensor.` prefix).
  - Set the state template to `unknown`.
5. Reconnect your Bangle.js: it will now update the new template sensor, which 
   *does* have a `unique ID`.

**Warning:** Do not customize the `Entity ID`: the app sends values by sensor 
ID, so you end up with both a non-updating template sensor and "dynamic" sensor 
without `unique ID`.
