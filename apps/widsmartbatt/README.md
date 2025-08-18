# Smart Battery Widget
Shows battery in terms of days (21 days, 12 hours), and uses the [`smartbatt`](https://banglejs.com/apps/?id=smartbatt) module to learn from daily battery drainage and provide accurate estimations.
This app was modified from `wid_a_battery_widget`, by @alainsaas

When you install this widget for the first time, or clear the data, it will also install the [`smartbatt`](https://banglejs.com/apps/?id=smartbatt) module as a dependency. As it learns your battery usage for the first time the forecast will fluctate, and will not be reliable for a while. As it compunds many drainage values together,  it will keep learning, and provide better predictions.
The module learns by averaging all the battery drainage over a period of time, and saves it to a json, averaging it with many others, providing an accurate prediction. The module gives the best forecast when you use the watch relatively similar per day.

Tap on the widget to show the battery percentage. It will go back to the days left after 3 seconds.

When charging, only the percentage is shown.
## Creator
RKBoss6
