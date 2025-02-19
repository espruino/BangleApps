# Battery Booster

A Bangle.js app designed to optimize battery life through smart screen and power management features.

## Features

### 1. Auto Soft-Off
- Automatically puts the watch into soft-off mode after 3 hours (10,800,000 ms) of being locked
- This feature is activated when the watch is locked and cancelled when unlocked

### 2. Dynamic Screen Timeout
- Sets LCD timeout to 2 seconds when the watch is locked
- Extends LCD timeout to 10 seconds when the screen is touched
- Helps preserve battery life while maintaining usability

### 3. Adaptive Brightness Control
- Automatically adjusts screen brightness based on the time of day
- Uses a sinusoidal pattern that follows natural daylight:
  - Peak brightness at noon
  - Lowest brightness at midnight
  - Gradual transitions in between
- Updates brightness every hour

## How It Works
The app runs in the background and manages three main aspects of power consumption:
1. Screen timeout duration
2. Automatic soft-off functionality
3. Time-based brightness adjustment

This combination of features helps extend battery life while maintaining a good user experience.