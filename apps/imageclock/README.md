# Imageclock

This app is a highly customizable watchface. To use it, you need to select
a watchface from another source.

# Usage

Choose the folder which contains the watchface, then clock "Upload to watch".

# Design watch faces

## Folder structure


* watchfacename
  * resources/
  * face.json
  * info.json


### resources

This folder contains image files. It can have subfolders. These files will
be read and converted into a resource bundle used by the clock

Folder types:

* Number
  * Contains files named 0.ext to 9.ext and minus.ext
* WeatherIcon
  * Contains files named with 3 digits for openweathermap weather codes, i.e. 721.ext
* Icon
  * Notifications: sound.ext, silent.ext, vibrate.ext
  * other status icons: on.ext, off.ext
* Scale
  * Contains the components of the scale, named 0.ext to y.ext, y beeing the last element of the scale

### face.json

This file contains the description of the watch face elements. 

#### Object types:

##### Properties
```
Properties: {
  "Redraw": {
    "Unlocked": 5000,
    "Locked": 6000
  }"
}
```
##### Images
```
Image: {
  "X": 0,
  "Y": 0,
  ImagePath: [ "path", "in", "resources", "file" ]
}
```

##### Coded Images
```
CodedImage: {
  "X": 0,
  "Y": 0,
  "Value": "WeatherCode",
  ImagePath: [ "path", "in", "resources", "file" ]
}
```
The `Value` field is one of the implemented numerical values.

##### Number

Can bottom right, or top left aligned. Will currently force all numbers to
be integer.

```
"Number": {
  "X": 123,
  "Y": 123,
  "Alignment": "BottomRight",
  "Value": "Temperature",
  "Spacing": 1,
  "ImagePath": [ "path", "to", "numbers", "folder" ]
}
```
The `Value` field is one of the implemented numerical values.
`Alignment` is either `BottomRight` or `TopLeft`

##### Scale

```
"Scale": {
  "X": 123,
  "Y": 123,
  "Value": "Temperature",
  "MinValue": "-20",
  "MaxValue": "50",
  "ImagePath": [ "path", "to", "scale", "folder" ]
}
```
The `Value` field is one of the implemented numerical values.
`MaxValue` and `MinValue` set the start and endpoints of the scale.

##### MultiState

```
"MultiState": {
  "X": 0,
  "Y": 0,
  "Value": "Lock",
  "ImagePath": ["icons", "status", "lock"]
}
```
The `Value` field is one of the implemented multi state values.

##### Nesting
```
Container: {
  "X": 10,
  "Y": 10,
  OtherContainer: {
    "X": 5,
    "Y": 5,
    SomeElement: {
      "X": 2,
      "Y": 2,
      <Content>
    }
  }
}
```
`SomeElement` will be drawn at X- and Y-position 2+5+10=17, because positions are relative to parent element.
Container names can be everything but other object names.

#### Implemented data sources

##### For Number objects

* Hour
* HourTens
* HourOnes
* Minute
* MinuteTens
* MinuteOnes
* Day
* DayTens
* DayOnes
* Month
* MonthTens
* MonthOnes
* Pulse
* Steps
* Temperature
* Pressure
* Altitude
* BatteryPercentage 
* BatteryVoltage
* WeatherCode
* WeatherTemperature

##### For MultiState

* on/off
  * Lock
  * Charge
  * Alarm
  * Bluetooth
  * BluetoothPeripheral
  * HRM
  * Barometer
  * Compass
  * GPS
* on/off/vibrate
  * Notifications

### info.json

This file contains information for the conversion process, it will not be 
stored on the watch

# TODO

* Performance improvements
  * Mark elements with how often they need to be redrawn
  * Use less RAM (maybe dedicated parser for JSON working on a stack/queue)
* Allow watchfaces to declare if the want to show widgets
* Temporarily show widgets with slide up/down
* Analog Hands?
* Finalize the file format
* Description of the file format
* Allow additional files for upload declared in info.json

# Creator

[halemmerich](https://github.com/halemmerich)
