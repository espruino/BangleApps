# Acceleration Data Provider

This app provides acceleration data via Bluetooth, which can be used in Gadgetbridge.

## Usage

This boot code runs in the background and has no user interface.
Currently this app is used to enable Sleep as Android tracking for your Banglejs using Gadgetbridge.

**Please Note**: This app only listens to "accel" events and sends them to your phone using Bluetooth.

[Gadgetbridge - Sleep as Android integration](https://gadgetbridge.org/basics/integrations/sleep-as-android/)

## Settings

- **Enabled**: Turns acceleration reporting on or off.
- **Interval**: How often the app sends the latest acceleration data to the phone. Shorter intervals use more power.
- **Widget**:
  - None: No widget is shown.
  - Sleep Icon: A bed icon appears in the top-right while `accelsender` is enabled.
- **Stop on Disconnect**: If Bluetooth disconnects, automatically disables `accelsender` so it does not keep running in the background.

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
