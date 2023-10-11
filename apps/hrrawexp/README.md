Extract hrm raw signal data to CSV file
=======================================

Simple app that will run the heart rate monitor for a defined period of time you set at the start.

Updated to work with new API. Additional capability includes:

1. Now also records upto 2 hours - if you cancel at any time the CSV file will still be there, the timer you set at the start is more so that you get an alert when it's complete.
2. Along with raw PPG readings, it also records bandpassed filtered data in a second column, available in the new API.
3. Rather than overwriting 1 data file, the app will record upto 5 files before recording to a generic data file as a fallback if all 5 allocated files remain on the watch storage. The limit is in place to avoid going over storage limits as these files can get large over time.

-The hrm sensor is sampled @50Hz and this app does not do any processing on it other than clip overly high/extreme values, the array is written as-is. There is an example Python script that can process this signal, smooth it and also extract a myriad of heart rate variability metrics using the hrvanalysis library:
https://github.com/jabituyaben/BangleJS-HRM-Signal-Processing
