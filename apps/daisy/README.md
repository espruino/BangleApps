# Daisy ![](app.png)

  *A beautiful digital clock with large ring guage, idle timer and a
   cyclic information line that includes, day, date, steps, battery,
   sunrise and sunset times*

Written by: [Hugh Barney](https://github.com/hughbarney) For support
and discussion please post in the [Bangle JS
Forum](http://forum.espruino.com/microcosms/1424/)

* Derived from [The Ring](https://banglejs.com/apps/?id=thering) proof of concept and the [Pastel clock](https://banglejs.com/apps/?q=pastel)
* Includes the [Lazybones](https://banglejs.com/apps/?q=lazybones) Idle warning timer
* Touch the top right/top left to cycle through the info display (Day, Date, Steps, Sunrise, Sunset, Heart Rate, Battery Estimate)
* The heart rate monitor is turned on only when Heart rate is selected and will take a few seconds to settle
* The heart value is displayed in RED if the confidence value is less than 50%
* NOTE: The heart rate monitor of Bangle JS 2 is not very accurate when moving about.
See [#1248](https://github.com/espruino/BangleApps/issues/1248)
* Uses mylocation.json from MyLocation app to calculate sunrise and sunset times for your location
* If your Sunrise, Sunset times look odd make sure you have setup your location using
[MyLocation](https://banglejs.com/apps/?id=mylocation)
* The screen is updated every minute to save battery power
* Uses the [BloggerSansLight](https://www.1001fonts.com/rounded-fonts.html?page=3) font, which if free for commercial use
* You need to run >2V22 to show the battery estimate in hours

## Future Development
* Use mini icons in the information line rather that text
* Add weather icons as per Pastel clock
* Add a lock icon to the screen

## Screenshots
![](screenshot_daisy1.png)
![](screenshot_daisy3.png)

It is worth looking at the real thing though as the screenshots do not do it justice.
