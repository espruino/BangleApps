Monitor Heart Rate Variability using the Bangle.JS
===================================================

One-time mode:
-------------

This will take a HRV measurement over a single approx 30 second period. It will also provide you with a HR reading based on the post-processing of the signal.

HRV metrics displayed are currently RMSSD (Root Mean Square of the Successive Differences) and also SDNN (standard deviation of NN intervals).

Continuous mode:
----------------

This will continually take measurements over 30 second periods every 3 and half minutes and log them to a CSV file on the Bangle until the watch is reset; this file can then be reviewed in Excel or other apps. The log file is reset each time you restart and select this mode to save on storage. The log file is just 1 line per each 3 minute cycle showing: timestamp, HR, SDNN, RMSSD, sample count, Temp (uncalibrated CPU temp), and movement based on the accelerometer. The additional metrics aside from the HRM data are useful in analysing sleep.

Note that in both modes, if the watch seems unresponsive, it's processing data and if you continue to hold the reset button it will eventually restart.

If your sample count is less than around 5 samples and/or the readings don’t look right, try repositioning the watch and try again - you can use the HR monitor app to confirm fitting.
