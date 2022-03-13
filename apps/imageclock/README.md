# Imageclock

This app is a highly customizable watchface. To use it, you need to select
a watchface from another source. There is a native format as described here. You can also load decompiled watchfaces for Amazfit BIP fitness trackers.

# Usage

## Install a watchface

Choose the folder which contains the watchface, then clock "Upload to watch".

## Usage on the watch

Slide up/down to hide/show widgets.
Press button to start launcher.

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
* CodedImage
  * Contains files named with only digits for codes, i.e. 721.ext
  * Contains a file named fallback.ext in case no code matches
  * Codes are evaluated as follows: 721 -> if not found check 720 -> if not found check 700 -> if found use
* MultiState
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
    "Locked": 60000,
    "Default": "Always",
    "Events": ["HRM"],
    "Clear": true
  },
  "Events": ["lock","HRM"]
}
```

Possible values for `Default` are `Always`, `Change`.

##### Images

```
"Image": {
  "X": 0,
  "Y": 0,
  "Scale": 1,
  "RotationValue": "Seconds",
  "MinRotationValue": 0,
  "MaxRotationValue": 60,
  "ImagePath": [ "path", "in", "resources", "file" ]
}
```

`RotationValue` references one of the implemented numerical values.
Mandatory:
* `ImagePath`

```
"Image": {
  "X": 0,
  "Y": 0,
  "Value": "BatteryPercentage",
  "Steps": 7,
  "ImagePath": [ "path", "in", "resources", "file" ]
}
```
If `Value` and `Steps`are given, the value is scaled and `Steps` number of images starting at 0 are used to display the value.

##### Coded Images
```
"CodedImage": {
  "X": 0,
  "Y": 0,
  "Value": "WeatherCode",
  "ImagePath": [ "path", "in", "resources", "file" ]
}
```
The `Value` field is one of the implemented numerical values.

##### Number

Can be aligned to bottom left, top left, bottom right, top right and center. Will currently force all numbers to
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

Mandatory:
* `ImagePath`
* `Value`

##### Scale

```
"Scale": {
  "X": 123,
  "Y": 123,
  "Value": "Temperature",
  "MinValue": "-20",
  "MaxValue": "50",
  "ImagePath": [ "path", "to", "scale", "folder" ],
  "Segments": [
    { "X": 5, "Y": 5},
    { "X": 10, "Y": 10 }
  ]
}
```
The `Value` field is one of the implemented numerical values.
`MaxValue` and `MinValue` set the start and endpoints of the scale.

Mandatory:
* `ImagePath`
* `Value`

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

Mandatory:
* `ImagePath`
* `Value`

##### Poly

```
"Poly":{
  "Filled": true,
  "RotationValue": "Second",
  "MinRotationValue": "0",
  "MaxRotationValue": "60",
  "ForegroundColor": "#00f",
  "BackgroundColor": "#008",
  "Vertices":[
    {"X":-1, "Y":13},
    {"X":0, "Y":15},
    {"X":1, "Y":13},
    {"X":2, "Y":0},
    {"X":1, "Y":-75},
    {"X":0, "Y":-80},
    {"X":-1, "Y":-75},
    {"X":-2, "Y":0}
  ]
}
```
The `RotationValue` field is one of the implemented numeric values.

##### Rect

```
"Rect":{
  "X": 10,
  "Y": 20,
  "Width": 30,
  "Height": 40,
  "Filled": true,
  "ForegroundColor": "#00f",
  "BackgroundColor": "#008"
}
```
The `RotationValue` field is one of the implemented numeric values.

##### Nesting
```
"Container": {
  "X": 10,
  "Y": 10,
  "OtherContainer": {
    "X": 5,
    "Y": 5,
    "SomeElement": {
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

##### Numerical

* Hour
* Hour12Analog
* Hour12
* HourTens
* HourOnes
* Minute
* MinuteAnalog
* MinuteTens
* MinuteOnes
* Second
* SecondAnalog
* SecondTens
* SecondOnes
* WeekDay
* WeekDayMondayFirst
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
* StepsGoal
* WeatherCode
* WeatherTemperature

##### Multistate

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
  * StepsGoal
  * WeatherTemperatureNegative
* on/off/vibrate
  * Notifications
* celsius/fahrenheit/unknown
  * WeatherTemperatureUnit

### info.json

This file contains information for the conversion process, it will not be 
stored on the watch

# TODO

* Handle events and redraws better
* Performance improvements
  * Mark elements with how often they need to be redrawn
* Finalize the file format
* Localization

# Creator

[halemmerich](https://github.com/halemmerich)
