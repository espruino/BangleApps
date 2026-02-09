# Acceleration Data Provider

This app provides acceleration data via Bluetooth, which can be used in Gadgetbridge.

## Usage

This boot code runs in the background and has no user interface.
Currently this app is used to enable Sleep as Android tracking for your Banglejs using Gadgetbridge.

**Please Note**: This app only listens to "accel" events and sends them to your phone using Bluetooth.

[Gadgetbridge - Sleep as Android integration](https://gadgetbridge.org/basics/integrations/sleep-as-android/)

## Widget

Enable the widget in the app settings to show when `accelsender` is active. Because sleep tracking is the primary use, the widget shows a bed icon in the top-right.

## Troubleshooting

### accelsender is stuck enabled

- **Cause:** Gadgetbridge only relays Sleep as Android "Start Tracking" and "Stop Tracking" messages while the phone is connected. If the phone is disconnected when "Stop Tracking" is sent, `accelsender` may remain enabled.
- **Fix:**
  - On the Bangle.js, go to `Settings > Apps > Accel Data Provider`, uncheck "Enabled".
  - Or on the phone, re-start and stop sleep tracking in Sleep as Android.

## Creator

[Another Stranger](https://github.com/anotherstranger)

## Acknowledgements

Special thanks to [José Rebelo](https://github.com/joserebelo) and [Rob Pilling](https://github.com/bobrippling)
for their Code Reviews and guidance.
