# Barcode clockwatchface

A scannable EAN-8 compatible clockwatchface for your Bangle 2

The format of the bars are

`||HHmm||MMwc||`

* Left section: HHmm
  * H: Hours
  * m: Minutes
* Right section: MM9c
  * M: Day of month
  * w: Day of week
  * c: Calculated EAN-8 digit checksum

Apart from that

* The upper left section displays total number of steps per day
* The upper right section displays total number of steps from last boot ("stepuptime")
* The face updates every 5 minutes or on demant by pressing the hardware button

This clockwathface is aware of theme choice, so it will adapt to Light/Dark themes.
