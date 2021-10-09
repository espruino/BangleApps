# Acceleration Recorder

This app records a short period of acceleration data from the accelerometer at
100Hz (starting when acceleration happens) and graphs it, working out max acceleration
and max velocity. Data can also be downloaded to your PC.

## Usage

* Start the `Accel Rec` App
* Select `Start` and place the Bangle with its rear face pointing downwards (screen up)
* After the counter counts down, it will display `Waiting`
* Now move the Bangle upwards (in the direction of `N`)

At this point the 2 second recording will start at 100 samples per second,
with a maximum of 8g.

After the 2 seconds you'll see a graph with calculated maximum acceleration
and velocity.

* Press BTN2 (labelled `FINISH`)
* Not choose `Save` and choose a slot, from 1 to 6. Slots already used
are marked with a `*`

## Getting data

* Go to the App Loader: https://banglejs.com/apps/
* Click `Connect` up the Top Right
* Click `My Apps`
* Click the Downward pointing arrow next to `Acceleration Recorder`
* After it loads, you'll see the recorded Acceleration values
* You can now either save them to a CSV file, or delete them
