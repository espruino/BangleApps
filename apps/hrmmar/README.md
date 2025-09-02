# HRM Motion Artifacts removal

Measurements from the build in PPG-Sensor (Photoplethysmograph) is sensitive to motion and can be corrupted with Motion Artifacts (MA). This module allows to remove these.

**WARNING:** On Bangle.js 2 this has been found to make heart rate readings [substantially less accurate in some cases](https://github.com/orgs/espruino/discussions/7738#discussioncomment-13594093) (the HRM already has built in motion artefact removal).

## Settings

* **MA removal**

Select the algorithm to Remove Motion artifacts:
  - None: No Motion Artifact removal.
  - fft elim: (default, *experimental*) Remove Motion Artifacts by cutting out the frequencies from the HRM frequency spectrum that are noisy in acceleration spectrum. Under motion this can report a heart rate that is closer to the real one but will fail if motion frequency and heart rate overlap.
