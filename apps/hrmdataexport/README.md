Extract hrm raw signal data to CSV file
=======================================

Simple app that will run the heart rate monitor for a defined period of time you set at the start. The max time value is 60 minutes but you can increase this just by changing the value in the app's script code if you wanted to - be mindful that your log file can get large and there are storage limitations if you start trying to log beyond this max.

The hrm sensor is sampled @50Hz and this app does not do any processing on it, the array is written as-is. There is an example Python script that can process this signal, smooth it and also extract a myriad of heart rate variability metrics using the hrvanalysis library:
https://github.com/jabituyaben/BangleJS-HRM-Signal-Processing 
