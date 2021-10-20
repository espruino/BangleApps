# Charging Dock

When charging shows the time, scans Bluetooth for known devices (eg temperature) and shows them on the screen.

Rotates by 90 degrees if it detects it is sideways, allowing for use
in a Charging Dock.

When devices are out of range (eg low water level in a plant) they are
highlighted red.

Currently supported devices:

* Mi Flora/other Xiaomi
* Bluetooth 0x1809 (eg. [Espruino Apps](https://espruino.github.io/EspruinoApps/#bletemp))
* Espruino Manufacturer Data (0x0590)

In the future it'd be nice to support more types of device in the future!

## Espruino Devices

To use your own Espruino device, use code like the following:

```
var data = {a:1,t:E.getTemperature()};
NRF.setAdvertising({},{
  showName:false,
  manufacturer:0x0590,
  manufacturerData:JSON.stringify(data)
});
```

Currently:

* `t` is the temperature (if defined)
* `t` is the alert status (1 or 0)
