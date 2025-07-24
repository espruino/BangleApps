# Smart Battery Module
A module for providing a truly accurate battery life in terms of days. The module learns from daily usage and drainage patterns, and extrapolates that. As you use it more, and the battery keeps draining, the predictions should become more accurate.

Because the Bangle.js battery percent fluctuates naturally, it is highly recomended to use the `Power Manager` app and enable monotonic/stable percentage to stabilize the percentage, and reduce fluctuations. This may help provide more accurate readings.
## Upon Install
Use an app that needs this module, like `Smart Battery Widget`.
When this app is installed, <i><b>do not rely on it for the first 24-30 hours.</b></i>
The module might return different data than expected, or a severely low prediction. Give it time. It will learn from drainage rates, which needs the battery to drain. If your watch normally lasts for a long time on one charge, it will take longer for the module to return an accurate reading.
## Settings
### Clear Data - Clears all learned data. 
Use this when you switch to a new clock or change the battery drainage in a fundamental way. The app averages drainage over time, and so you might just want to restart the learned data to be more accurate for the new configurations you have implemented.

If you think something is wrong with the predictions, try clearing the data, and let it rebuild the data again from scratch.
## Creator
RKBoss6
