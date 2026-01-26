# My Profile

Configure your personal profile. All settings are optional and are only stored on the watch.

## Available settings

| Setting       | Description                     | Displayed in        | Stored in    | Default value | How to measure                                                    |
| ------------- | ------------------------------- | ------------------- | ------------ | ------------- | ----------------------------------------------------------------- |
| Birthday      | Used to calculate age           | year, month, day    | 'YYYY-MM-DD' | 01.01.1970    | -                                                                 |
| HR max        | Maximum heart rate              | BPM                 | BPM          | 60            | Use maximum value when exercising.<br/> If unsure set to 220-age. |
| Height        | Body height                     | local length unit   | meter        | 0 (=not set)  | -                                                                 |
| Weight        | Body weight                     | kg                  | kf           | 0 (=not set)  | -                                                                 |
| Gender        | Your gender, for metabolism purposes (used by Calories app)| --           | 0=male, 1=female, 2=not set           | 2 (=not set)  | - |
| Stride length | Distance traveled with one step | local length unit   | meter        | 0 (=not set)  | Walk 10 steps and divide the travelled distance by 10             |
| Resting Hr (used to be HR min)   | The minimum heart rate your body beats while resting              | BPM                 | BPM          | Not set (uses old min HR value if available)          | Take an RHR reading in Health (v0.38) |


## Developer notes

- Feel free to add additional settings.
- For values without reasonable defaults never assume that a value is set. Always check the value before using it.
