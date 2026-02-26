# My Profile

Configure your personal profile. All settings are optional and are only stored on the watch.

## Available settings

| Setting       | Description                     | Displayed in        | Stored in    | Default value | How to measure                                                    |
| ------------- | ------------------------------- | ------------------- | ------------ | ------------- | ----------------------------------------------------------------- |
| Birthday      | Used to calculate age           | year, month, day    | 'YYYY-MM-DD' | 01.01.1970    | -                                                                 |
| HR max        | Maximum heart rate              | BPM                 | BPM          | 60            | Use maximum value when exercising.<br/> If unsure set to 220-age. |
| HR min        | minimum heart rate              | BPM                 | BPM          | 200           | Measure your heart rate after waking up, or take an RHR reading (below)                         |
| Height        | Body height                     | local length unit   | meter        | 0 (=not set)  | -                                                                 |
| Weight        | Body weight                     | kg                  | kf           | 0 (=not set)  | -                                                                 |
| Gender        | Your gender, for metabolism purposes (used by Calories app)| --           | 0=male, 1=female, 2=not set           | 2 (=not set)  | - |
| Stride length | Distance traveled with one step | local length unit   | meter        | 0 (=not set)  | Walk 10 steps and divide the travelled distance by 10             |
| Resting Hr  | The minimum heart rate your body beats while resting              | BPM                 | BPM          | Not set (--)   | Take an RHR reading|

### RHR Reading: 
You can take a Resting Heart Rate measurement, which can be indicative of your cardiovascular health and overall fitness. RHR is the heart rate when you are resting, and is the lowest heart rate you can possibly beat. Generally, a lower RHR indicates better cardiovascular health and endurance. To take a reading, you must be very still and have the watch snug around your wrist (light leaking in can affect the reading). For best results, lie or sit quietly and rest for about 10 minutes before starting the measurement. It is recommended to take the measurement right before you go to sleep or as soon as you wake up.

Take a reading in the settings page, follow the prompted instructions, and start the test. The app does not enforce or time the resting period that you should take prior, so ensure you have already been resting for around 10 minutes before pressing the button. Upon completion, check if the reading looks accurate, and choose whether to save it or not. A normal RHR for adults is 55-80 BPM.

## Developer notes

- Feel free to add additional settings.
- For values without reasonable defaults never assume that a value is set. Always check the value before using it.
