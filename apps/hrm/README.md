# Heart Rate Monitor

Displays current heart rate in Beats per minute (BPM).

## Settings

* **MA removal**

Measurements from the build in PPG-Sensor (Photoplethysmograph) are sensitive to motion and can be corrupted with Motion Artifacts (MA). These can be removed with the following algorithms:
  - None: (default) No Motion Artifact removal.
  - fft elim: (*experimental*) Remove Motion Artifacts by cutting out the frequencies from the HRM frequency spectrum that are noisy in acceleration spectrum. Under motion this can report a heart rate that is closer to the real one but will fail if motion frequency and heart rate overlap.
