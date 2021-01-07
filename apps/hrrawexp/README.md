Extract hrm raw signal data to CSV file
=======================================

Simple app that will run the heart rate monitor for a defined period of time you set at the start.

-The app creates a csv file (it's actually just 1 column) and you can download this via My Apps in the App Loader.

-The max time value is 60 minutes.

-The first item holds the data/time when the readings were taken and the file is reset each time the app is run.

-The hrm sensor is sampled @50Hz and this app does not do any processing on it other than clip overly high/extreme values, the array is written as-is. There is an example Python script that can process this signal, smooth it and also extract a myriad of heart rate variability metrics using the hrvanalysis library:
https://github.com/jabituyaben/BangleJS-HRM-Signal-Processing
