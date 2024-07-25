# Burn: Calorie Counter

Burn is a simple calorie counter application. It is based on the original Counter app and has been enhanced with additional features (I recommend using
it with the "Digital Clock Widget", if you intend to keep it running).

## Features

- **Persistent counter**: The counter value is saved to flash, so it persists even when the app is closed or the device is restarted.
- **Daily reset**: The counter resets each day, allowing you to track your calorie intake on a daily basis.
- **Adjustable increment value**: You can adjust the increment value to suit your needs.

## Controls

### Bangle.js 1

- **BTN1**: Increase (or tap right)
- **BTN3**: Decrease (or tap left)
- **Press BTN2**: Change increment

### Bangle.js 2

- **Swipe up**: Increase
- **Swipe down**: Decrease
- **Press BTN**: Change increment

## How it Works

The counter value and the date are stored in a file named "kcal.txt". The counter value is read from the file when the app starts and written to the file whenever the counter value is updated.

The app uses the current date to determine whether to reset the counter. If the date has changed since the last time the counter was updated, the counter is reset to 0.
