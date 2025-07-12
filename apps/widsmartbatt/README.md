# Smart Battery Widget
Shows battery in terms of days (21 days, 12 hours), and learns from your daily usage to give better estimations.
This app was modified from `wid_a_battery_widget`, by @alainsaas

When you install the app for the first time, or clear the data, the forecast will fluctate, and will not be reliable for a while. As it learns from your usage,  it will keep learning, and provide better predictions.
The app learns by averaging all the power draw whenever it needs to draw, and saves it to a json, averaging it with many others, providing an accurate prediction. The app gives the best forecast when you use the watch relatively similar per day.

Tap on the widget to show the battery percentage. It will go back to the days left after 3 seconds.
## Settings
* Clear Data - Clears the learned data. Useful when you change something fundamental that affects battery usage. (eg. New clock, turn on GPS daily, LCD backlight setting changes.)
## Creator
RKBoss6
