# OpenSeizureDetector Widget

A widget to work alongside [OpenSeizureDetector](https://www.openseizuredetector.org.uk/)

This is currently just a test and is not ready for everyday use.

When the widget is running it puts the accelerometer into 25Hz mode, and then
roughly every second it outputs 20 samples (bytes) of acceleration data as a notification
on BLE Service  `"a19585e9-0001-39d0-015f-b3e2b9a0c854"`, characteristic `"a19585e9-0002-39d0-015f-b3e2b9a0c854"`.

Each byte is 1/25th of a second, with a magnitude of acceleration. It is scaled
such that 1g is 64.
