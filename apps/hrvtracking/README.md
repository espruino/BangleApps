# HRV Tracking
Tracks your HRV over time while you're asleep and establishes a personal baseline (average) for 30 days.
You can see your HRV as well as past HRVs in the app, and the HRV updates every day (while asleep)

Note: HRV measurements do not match up with other smartwatches, because each smartwatch measures HRV differently. This app uses the RMSSD formula. You should also not rely on these measurements as a medical diagnosis, as the HRM sensor & these algorithms on the Bangle.js will never be as good as Apple or Garmin. Treat these simply as additional insight, and not a concrete diagnosis, as the measurements can always be wrong.

## How it works
The reading starts by looking at the raw HR data. It detects the peaks (beats) and the time between the beats. Next, it uses the RMSSD formula to create the HRV measurement.

The app takes around 4-10 readings while you sleep, depending on what times you set it to run. From there,it averages all the HRV readings in the night to get a daily HRV. It averages all the daily HRVs from the past 20 days to create your baseline HRV.

## Interpreting values
**Note: The baseline value will not be accurate for 20 days, as it averages across those 20 days to get a proper baseline**
HRV measurements are different for everyone, which is why HRV measurements are always compared to your personal baseline. HRV is how watches like Apple and Garmin estimate features like stress levels, body battery/energy, and training readiness.

Generally, if your HRV is higher than your baseline, you are fully recovered/rested and ready for heavy training. It can also mean that your stress is much less than usual (if you have persistent stress)

If your HRV is substantially lower than usual, this could mean several things:
- Your body is fighting an illness (can be before you see any symptoms)
- Your stress is higher than usual
- Your body is recovering from strenuous physical activity
- Your body is suffering from poor sleep
- Heavy alcohol consumption
## Settings
You must choose the start and end date for measurements - this must be while you are asleep. 3AM to 5AM is the default, but if you sleep at different times, you can change this. 

Measurements are NOT accurate while you are moving the slightest bit, as this introduces lots of motion artifacts that the HRV algorithm gets confused on. This is why the measurements are taken while asleep, when you are still. Measurements are taken once every 20-30 minutes. (24 minutes is the interval, but depending on apps loaded while sleeping, this could change)

**Start time** - Selects the time to start measurements at. 

**End time** - Selects the time to end measurements at.

**Enabled** - Whether or not measurements should be taken at all.
## App
In the app, you can see your HRV for today, your personal baseline or usual, and past HRV readings. 

## Authors
- RKBoss6

- [HRV Algorithms by Jabituyaben](https://github.com/jabituyaben/Espruino-HRV)
