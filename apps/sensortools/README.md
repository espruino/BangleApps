# Sensor tools

This allows to simulate sensor behaviour for development purposes


## Per Sensor settings:

Enabled:
* **true**
* **false**

Mode:
* **emulate**: Completely craft events for this sensor
* **modify**: Take existing events from real sensor and modify their data

Name:
* name of the emulation or modification mode

Power:
* **emulate**: Simulate Bangle._PWR changes, but do not call real power function
* **nop**: Do nothing, ignore all power calls for this sensor but return true
* **passthrough**: Just pass all power calls unmodified
* **on**: Do not allow switching the sensor off, all calls are switching the real sensor on

### HRM

Modes:
* **modify**: Modify the original events from this sensor
* **emulate**: Create events simulating sensor activity

Modification:
* **bpmtrippled**: Multiply the bpm value of the original HRM values with 3

Emulation:
* **sin**: Calculate bpm changes by using sin

### GPS

Modes:
* **emulate**

Emulation:
* **staticfix**: static complete fix with all values
* **route**: A square route starting in the SW corner and moving SW->NW->NO->SW... [Download as gpx](square.gpx)
* **routeFuzzy**: Roughly the same square as route, but with 100m seqments with some variaton in course [Download as gpx](squareFuzzy.gpx)
* **nofix**: All values NaN but time,sattelites,fix and fix == 0
* **changingfix**: A fix with randomly changing values

### Compass

Modes:
* **emulate**

Emulation:
* **static**: All values but heading are 1, heading == 0
* **rotate**: All values but heading are 1, heading rotates 360°

# Creator

[halemmerich](https://github.com/halemmerich)