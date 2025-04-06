# HeatSuite Watch Application

This is the HeatSuite Watch Application which allows for seemless integration into the HeatSuite platform (docs coming soon). You may use this watch application independent of the full(er) HeatSuite platform.  

## What is HeatSuite?

HeatSuite is a comprehensive all in one solution for researchers to monitor the physiological, behavioural, and perceptual responses of individuals and their personal environmental exposure. Learn more on the details of the HeatSuite platform here.

## Why do we need this?

Consumer and research-based wearables have largely determined what researchers can measure in the field, and/or have proprietary postprocessing embedded into the hardware/software stack which limits transparency and transferrability of data collected. HeatSuite challenges this one-sided relationship, offering a solution for researchers who desire access and awareness of how and what data they are collecting from *their* participants.

## Watch Specific Features

This is a list of current features available when using the HeatSuite Watch Application:

+ Per minute averaging and/or sum of onboard watch sensor data (Heart rate, barometer temperature and pressure, accelerometer, battery)
+ High temporal resolution accelerometer logging (x,y,z per second)
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

The current interation of the HeatSuite application provides the option to average the accelerometer `x,z,y` every second (known as High Temporal Resolution Accelerometer Logging), and/or magnitude per minute. Magnitude is calculated in the Espruino firmware as:

``` 
sqrt(x^2 + y^2 + z^2)
```

To transform this to [Euclidean norm minus one (ENMO)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0061691) format:

```
ENMO = acc_avg - 1
```
Where `acc_avg` is the average acceleration magnitude per minute, available in the CSV file. While this may be satisfactory for offline long term monitoring (+2 weeks), it is recommended to use per second `xyz` data.

## Applications/modules that HeatSuite integrates:

* [BTHRM](https://banglejs.com/apps/#bthrm)
* [coretemp](https://banglejs.com/apps/#coretemp)
* [gpssetup](https://banglejs.com/apps/#gpssetup)
* [recorder](https://banglejs.com/apps/#recorder) (modified in HeatSuite code to incorporate per minute averaging)

## Research Using HeatSuite:

Ravanelli N, Lefebvre K, Mornas A, & Gagnon D. *Evaluating compliance with HeatSuite for monitoring in-situ physiological and perceptual responses and personal environmental exposure*. npj-Digital Medicine (Accepted 2025).

## Creator

[Nicholas Ravanelli, PhD](https://github.com/nravaneli)
