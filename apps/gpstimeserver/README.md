# GPS Time Server

A widget which automatically starts the GPS and turns Bangle.js into a Bluetooth time server, UUID 0x1805.

Other Espruino Bluetooth devices can then find it and use it to synchronise time.

**Note:** Because GPS is kept on, you'll need to keep your Bangle.js on charge for this to be useful.

## Usage

Just install this widget, and from then on any app which loads widgets will
display the icon ![](widget.png) in the top left, and Bangle.js will be
broadcasting the current time to any device that connects.

## Technical

This implements the [Bluetooth Time Service](https://www.bluetooth.org/docman/handlers/downloaddoc.ashx?doc_id=292957) listed [here](https://www.bluetooth.com/specifications/gatt/).

The Bluetooth docs are verbose and hard to read, so here's a rundown of how it works.

* The Bangle advertises service `0x1805`
* You connect to it, and request service `0x1805` and characteristic `0x2A2B`
* A 10 byte array is returned:

```
[
  year_lowbyte,
  year_highbyte,
  month,
  day_of_month,
  hours,
  minutes,
  seconds,
  day_of_week, // 1=monday...7=sunday
  subseconds, // 0..255
  update_reason // 0=unknown currently
]
```

```
//NRF.requestDevice({ filters: [{ services: ['1805'] }] }).then(print)

var gatt;
NRF.connect("c7:4b:2e:c6:f5:45 random").then(function(g) {
  gatt = g;
  return gatt.getPrimaryService("1805");
}).then(function(service) {
  return service.getCharacteristic("2A2B");
}).then(function(c) {
  return c.readValue();
}).then(function(d) {
  console.log("Got:", JSON.stringify(d.buffer));
  var year = d.getUint16(0,1);
  // ...
  gatt.disconnect();
}).catch(function(e) {
  console.log("Something's broken.",e);
});
```
