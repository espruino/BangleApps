# Smart Battery Module
A module for providing a truly accurate battery life in terms of days. The module learns from daily usage and drainage patterns, and extrapolates that. As you use it more, and the battery keeps draining, the predictions should become more accurate.

Because the Bangle.js battery percent fluctuates naturally, it is highly recomended to use the `Power Manager` app and enable monotonic/stable percentage to stabilize the percentage, and reduce fluctuations. This may help provide more accurate readings.
## Upon Install
Use an app that needs this module, like `Smart Battery Widget`.
When this app is installed, <i><b>do not rely on it for the first 24-30 hours.</b></i>
The module might return different data than expected, or a severely low prediction. Give it time. It will learn from drainage rates, which needs the battery to drain. If your watch normally lasts for a long time on one charge, it will take longer for the module to return an accurate reading.

If you think something is wrong with the predictions after 3 days, try clearing the data, and let it rebuild again from scratch.
## Clock Infos
The module provides two clockInfos:
- Days left
- Learned drainage rate per hour

## Settings
### Clear Data - Clears all learned data. 
Use this when you switch to a new clock or change the battery drainage in a fundamental way. The app averages drainage over time, and so you might just want to restart the learned data to be more accurate for the new configurations you have implemented.
### Logging - Enables logging for stats that this module uses. 
To view the log file, go to the [Web IDE](https://www.espruino.com/ide/#), click on the storage icon (4 discs), and scroll to the file named `smartbattlog.json`. From there, you can view the file, copy to editor, or save it to your computer.
Logs:
* The time in a human-readable format (hh:mm:ss, mm:dd:yy) when the record event was triggered
* The current battery percentage
* The last saved battery percentage
* The change in hours between the time last recorded and now
* The average or learned drainage for battery per hour
* The status of that record event:
  * Recorded
  * Skipped due to battery fluctuations or no change
  * Invalid time between the two periods (first record)
## Functions
From any app, you can call `require("smartbatt")` and then one of the functions below:
* `require("smartbatt").record()` - Attempts to record the battery and push it to the average.
* `require("smartbatt").get()` - Returns an object that contains:

  
  * `hrsRemaining` - Hours remaining
  * `avgDrainage` - Learned battery drainage per hour
  * `totalCycles` - Total times the battery has been recorded and averaged
  * `totalHours` - Total hours recorded
  * `batt` - Current battery level

    
* `require("smartbatt").deleteData()` - Deletes all learned data. (Automatically re-learns)
## Creator
- RKBoss6
## Contributors
- RelapsingCertainly
