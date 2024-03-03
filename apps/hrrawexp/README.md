Extract hrm raw signal data to CSV file
=======================================

Simple app that will run the heart rate monitor for a defined period of time you set at the start and record data to a csv file.

Updated to work with new API and includes support for Bangle.js 2. Additional capability includes:

1. Now also records upto 2 hours - if you cancel at any time the CSV file will still be there, the timer you set at the start is more so that you get an alert when it's complete.
2. Along with raw PPG readings, it also records bandpassed filtered data in a second column, available in the new API.
3. Rather than overwriting 1 data file, the app will record upto 5 files before recording to a generic data file as a fallback if all 5 allocated files remain on the watch storage. The limit is in place to avoid going over storage limits as these files can get large over time.

-The hrm sensor is sampled @50Hz on the Bangle.JS 1 and 25Hz on the Bangle 2 by default. At least on the Bangle 2 you can change the sample rate by using the 'custom boot code' app and running this line:
Bangle.setOptions({hrmPollInterval:20});­

the 20 in the boot code means the hrm will poll every 20ms (50Hz) instead of the default 40. 

4. On the bangle.JS 2 you can swipe up to begin recording, and on the Bangle.JS 1 you just use the top button.

For Bangle 1, there is an example Python script that can process this signal, smooth it and also extract a myriad of heart rate variability metrics using the hrvanalysis library. I will be working on a method for Bangle 2 because the data seems more noisy so will need a different processing method:
https://github.com/jabituyaben/BangleJS-HRM-Signal-Processing
