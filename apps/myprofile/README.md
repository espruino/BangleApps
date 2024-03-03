# My Profile

Configure your personal profile. All settings are optional and are only stored on the watch.

## Available settings

| Setting       | Description                     | Displayed in        | Stored in    | Default value | How to measure                                                    |
| ------------- | ------------------------------- | ------------------- | ------------ | ------------- | ----------------------------------------------------------------- |
| Birthday      | Used to calculate age           | year, month, day    | 'YYYY-MM-DD' | 01.01.1970    | -                                                                 |
| HR max        | maximum heart rate              | BPM                 | BPM          | 60            | Use maximum value when exercising.<br/> If unsure set to 220-age. |
| HR min        | minimum heart rate              | BPM                 | BPM          | 200           | Measure your heart rate after waking up                           |
| Height        | Body height                     | local length unit   | meter        | 0 (=not set)  | -                                                                 |
| Weight        | Body weight                     | kg                  | kf           | 0 (=not set)  | -                                                                 |
| Stride length | distance traveled with one step | local length unit   | meter        | 0 (=not set)  | Walk 10 steps and divide the travelled distance by 10             |

## Developer notes

- Feel free to add additional settings.
- For values without reasonable defaults never assume that a value is set. Always check the value before using it.
