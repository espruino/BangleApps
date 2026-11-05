# Mesh Client
A standalone app to connect to and interface with a Meshtastic device over BLE.

## How To Use
Currently, the meshtastic device this app connects to cannot have a PIN set, so you will need to
change that using the phone app to NO_PIN under bluetooth settings.

1. Open app, it will automatically begin searching for a meshtastic device over BLE
2. Turn on radio, or if radio is already on, it will connect to the highest RSSI device with no PIN
3. It usually takes a second or two for the connected device's short name or ID and battery voltage to show in header
4. Nodes populate and update as they are seen through incoming packets.
5. CHANNEL option for main screen is for setting outgoing messages, all channel messages will show up in chat with their channel # prefixed

## Future Updates

### Priority
- [ ] Add Security PIN setting
- [ ] Add ACK to sent messages
- [ ] Change last heard format to use actual timestamps from radio instead of watch time.
- [x] Add scrolling on messages screen to allow for viewing more messages

### Secondary
- [ ] Add option to update Radio GPS from watch
- [ ] Add option to add preset messages for chat
- [x] Resolve Short/Long name decoding issue
- [ ] QOL updates
