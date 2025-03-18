# HRM Motion Artifacts removal

Measurements from the build in PPG-Sensor (Photoplethysmograph) is sensitive to motion and can be corrupted with Motion Artifacts (MA). This module allows to remove these.

## Settings

* **MA removal**

Select the algorithm to Remove Motion artifacts:
  - None: No Motion Artifact removal.
  - fft elim: (default, *experimental*) Remove Motion Artifacts by cutting out the frequencies from the HRM frequency spectrum that are noisy in acceleration spectrum. Under motion this can report a heart rate that is closer to the real one but will fail if motion frequency and heart rate overlap.
