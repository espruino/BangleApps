# Barcode clock(watch)face

A scannable EAN-8 compatible face for your Bangle 2

The format of the bars are

`[HHmm] [MMwc]`

* Left section: HHmm
  * H: Hours
  * m: Minutes
* Right section: MM9c
  * M: Day of month
  * w: Day of week
  * c: Calculated EAN-8 digit checksum

This face is aware of theme choice, so it will adapt to Light/Dark themes.
