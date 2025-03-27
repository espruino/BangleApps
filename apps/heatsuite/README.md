# HeatSuite Watch Application

This is the HeatSuite Watch Application which allows for seemless integration into the HeatSuite platform (docs coming soon). You may use this watch application independent of the full(er) HeatSuite platform.  

## What is HeatSuite?

HeatSuite is a comprehensive all in one solution for researchers to monitor the physiolocial, behavioural, and perceptual responses of individuals and their personal environmental exposure. Learn more on the details of the HeatSuite platform here.

## Why do we need this?
Commercial enterprises have largely determined what researchers can measure in the field, and/or have proprietary postprocessing embedded into the hardware/software stack which limits transparency and transferrability of data collected. HeatSuite eliminates this one-sided relationship, offering a solution for researchers who desire access and awareness of how and what the actual data is.

## Watch Specific Features
This is a list of current features available when using the HeatSuite Watch Application:

+ Per minute averaging and/or sum of onboard watch sensor data (Heart rate, barometer temperature and pressure, accelerometer, battery)
+ Can connect external bluetooth devices for added physiological monitoring (e.g. Bluetooth Heart Rate, CORE Sensor) - more being added
+ Connect and store data from other devices including:
    + Blood Pressure Monitor (A&D Medical UA651-BLE)
    + Oral Temperature using custom dongle - Contact [Nicholas Ravanelli, PhD](emailto:nick.ravanelli@gmail.com)
    + Body Mass Scale (Xiaomi Composition Scale 2)
+ Collect perceptions and behaviour using ecological momentary assessments with onboard questionnaires
+ Mictruition frequency and color analysis for index of hydration status
+ Create study schedules for participants to receive programmatic nudges daily, specific to each task
+ Programmatic GPS monitoring, with adaptive power switching for battery optimization
+ Fall Detection and bluetooth broadcasting (beta)

## Watch accelerometer data

The current interation of the HeatSuite application only averages the accelerometer magnitude, which is calculated in the Espruino firmware as:

```math 
x^2 + y^2 + z^2
```

To transform this to [Euclidean norm minus one (ENMO)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0061691) format:

```math
ENMO = \sqrt(acc\_avg) - 1
```
Where `acc_avg` is the average acceleration magnitude per minute, available in the CSV file.

## Applications/modules that HeatSuite integrates:

* [BTHRM](https://banglejs.com/apps/#bthrm)
* [coretemp](https://banglejs.com/apps/#coretemp)
* [gpssetup](https://banglejs.com/apps/#gpssetup)
* [recorder](https://banglejs.com/apps/#recorder) (modified in HeatSuite code to incorporate per minute averaging)

## Research Using HeatSuite:


## Creator

[Nicholas Ravanelli, PhD](https://github.com/nravaneli)
