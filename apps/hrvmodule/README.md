# HRV Tracking
Tracks your HRV over time while you're asleep and establishes a personal baseline (average) for 30 days.
You can see your HRV as well as past HRVs in the app, and the HRV updates every day (while asleep)

Note: HRV measurements do not match up with other smartwatches, because each smartwatch measures HRV differently. This app uses the RMSSD formula. You should also not rely on these measurements as a medical diagnosis, as the HRM sensor & these algorithms on the Bangle.js will never be as good as Apple or Garmin. Treat these simply as additional insight, and not a concrete diagnosis, as the measurements can always be wrong.

## Interpreting values
HRV measurements are different for everyone, which is why HRV measurements are always compared to your personal baseline. 

Generally, if your HRV is higher than your baseline, you are fully recovered/rested and ready for heavy training. It can also mean that your stress is much less than usual (if you have persistent stress)

If your HRV is substantially lower than usual, this could mean several things:
- Your body is fighting an illness (can be before you see any symptoms)
- Your stress is higher than usual
- Your body is recovering from strenuous physical activity
- Your body is suffering from poor sleep
- Heavy alcohol consumption
## Settings
You must choose the start and end date for measurements - this must be while you are asleep. 3AM to 4AM (inclusive) is the default, but if you sleep at different times, you can change this. 

Measurements are NOT accurate while you are moving the slightest bit, as this introduces lots of motion artifacts that the HRV algorithm gets confused on. This is why the measurements are taken while asleep, when you are still.

## App
In the app, you can see your HRV for today, your personal baseline or usual, and past HRV readings. 

## Authors
- RKBoss6

- [HRV Algorithms by Jabituyaben](https://github.com/jabituyaben/Espruino-HRV)
