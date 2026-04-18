# Charge Gently

Charging Li-ion batteries to their full capacity can lower their lifespan. If possible, it is good practice to charge more often, but only to 80% capacity.

**Note:** continually running your Bangle.js battery flat will impact its life far more than charging it fully - only use this app if you're able to charge often enough that the Bangle.js battery isn't dropping below 20%.

The first stage of charging Li-ion ends at ~80% capacity when the charge voltage reaches its peak*. When that happens, the watch will buzz twice every 30s to remind you to disconnect the watch.

This app has no UI and no configuration. To disable the app, you have to uninstall it.

Tap the charged notification to prevent buzzing for this charging session.

New in v0.03: before the very first buzz, the average value after the peak is written to chargent.json and used as threshold for future charges. This reduces the time spent in the second charge stage.

Side notes
- Full capacity is reached after charge current drops to an insignificant level. This is quite some time after charge voltage reached its peak / `E.getBattery()` returns 100.
- The battery is 175mAh and charging happens at 100mA, so a full charge from flat will take around 1.75 hours.
- This app starts buzzing some time after `E.getBattery()` returns 100 (~15min on my watch), and at least 5min after the peak to account for noise.

\* according to https://batteryuniversity.com/article/bu-409-charging-lithium-ion assuming similar characteristics and readouts from pin `D30` approximate charge voltage
