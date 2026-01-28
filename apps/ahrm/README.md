# AHRM (Adaptive Hearth Rate Monitor)

A background application that records health data (heart rate and movement) using an adaptive algorithm to optimize battery consumption. It has no visible user interface in the launcher.

## How it Works

The app dynamically adjusts the frequency at which data is measured and saved. When it detects physical activity or greater heart rate variability, it increases the measurement frequency to capture more detailed data. During periods of rest, measurements become less frequent to save battery.

## Adaptive Algorithm: Details and Thresholds

The algorithm uses the **mean (`avg`)** and **standard deviation (`sd`)** of recent movement and heart rate data to decide the recording frequency.

*   **Mode 2 (Every 10 minutes - Rest)**: This is the base mode, active when movement is minimal.
*   **Mode 4 (Every 5 minutes - Light Activity)**: Activates with light, consistent movement.
    *   *Threshold*: Movement standard deviation (`mv_sd`) between `50`-`80` AND movement average (`mv_avg`) < `130`.
*   **Mode 1 (Every 3 minutes - Moderate Activity)**: Activates with moderate movement or heart rate variability.
    *   *Thresholds*: `mv_sd` between `80`-`110` OR `mv_avg` between `130`-`260`, OR heart rate standard deviation (`hr_sd`) between `10`-`15`.
*   **Mode 3 (Every 1 minute - Intense Activity)**: The most frequent mode, triggered by high movement or heart rate variability. It has priority over all others.
    *   *Thresholds*: `mv_sd` > `110` OR `mv_avg` > `260`, OR `hr_sd` > `15`.

## Internal Data Structures

The adaptive algorithm relies on a custom data structure, `UintRecorder`, which acts as a circular buffer (or ring buffer) to keep a recent history of sensor data.

*   **`hrHistory`**: An instance of `UintRecorder` that stores the last **120** heart rate samples.
*   **`movementHistory`**: An instance of `UintRecorder` that stores the last **10** aggregated movement values.

hrHistory and movementHistory are updated every 10sec (callback onMovement).
When new data is added, the oldest data point is discarded, ensuring that the calculations for average and standard deviation are always based on the most recent activity.

## Data Storage

Data is saved daily in **CSV** format files.

*   **File Name**: The filename follows the convention `HealthRecordAYYYYMMDD.csv`, where `YYYY`, `MM`, and `DD` represent the year, month, and day.
*   **Data Structure**: Each row in the CSV file contains the following fields, separated by a comma:
    *   `Time`: The time of the measurement in `HH:MM` format.
    *   `Movement`: An integer value representing the intensity of movement.
    *   `Accuracy`: The confidence percentage (0-100) of the heart rate measurement.
    *   `BPM`: The recorded beats per minute (BPM).

### How to Access Data

Since the app has no graphical interface, to view the data you need to connect the Bangle.js to your computer via the **Web IDE** or **Bangle.js App Loader** and download the `.csv` files from the device's storage (in the "Storage" section).

## Settings

The only available setting allows you to enable or disable data recording.

*   **Path**: It is located in the main Bangle.js menu, under `Settings -> App Settings -> Health`.
*   **Option**:
    *   **ADAPTIVE HRM**: Select to enable (✓) or disable the feature.
